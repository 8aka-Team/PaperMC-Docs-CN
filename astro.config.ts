import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import d2 from "astro-d2";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import starlightSidebarTopics from "starlight-sidebar-topics";
import codeConstantsPlugin from "./src/utils/remark/code_const";
import javadocPlugin from "./src/utils/remark/javadoc";
import {
  LATEST_FOLIA_RELEASE,
  LATEST_MC_RELEASE,
  LATEST_PAPER_RELEASE,
  LATEST_USERDEV_RELEASE,
  LATEST_VELOCITY_RELEASE,
  LATEST_WATERFALL_RELEASE,
} from "./src/utils/versions";

const prod = process.env.NODE_ENV === "production";

// https://astro.build/config
export default defineConfig({
  site: prod ? "https://paper.8aka.org" : undefined,
  integrations: [
    // save Markdown renderer configuration to globals for use by the on-demand renderer
    // order matters - we want this to use only our configuration
    {
      name: "docs:config-md",
      hooks: {
        "astro:config:setup": ({ config }) => {
          globalThis.markdownConfig = { ...config.markdown };
        },
      },
    },
    starlight({
      title: "PaperMC 中文文档",
      social: [
        { icon: "github", label: "paper:GitHub", href: "https://github.com/PaperMC/Paper" },
        { icon: "seti:java", label: "paper:Javadoc", href: `https://jd.papermc.io/paper/${LATEST_PAPER_RELEASE}` },

        { icon: "github", label: "velocity:GitHub", href: "https://github.com/PaperMC/Velocity" },
        {
          icon: "seti:java",
          label: "velocity:Javadoc",
          href: `https://jd.papermc.io/velocity/${LATEST_VELOCITY_RELEASE.substring(0, LATEST_VELOCITY_RELEASE.lastIndexOf("."))}.0`,
        },

        { icon: "github", label: "folia:GitHub", href: "https://github.com/PaperMC/Folia" },
        {
          icon: "seti:java",
          label: "folia:Javadoc",
          href: `https://jd.papermc.io/folia/${LATEST_FOLIA_RELEASE.split(".").slice(0, 2).join(".")}`,
        },

        { icon: "github", label: "waterfall:GitHub", href: "https://github.com/PaperMC/Waterfall" },
        {
          icon: "seti:java",
          label: "waterfall:Javadoc",
          href: `https://jd.papermc.io/waterfall/${LATEST_WATERFALL_RELEASE}`,
        },

        { icon: "github", label: "GitHub", href: "https://github.com/PaperMC" },
        { icon: "seti:java", label: "Javadoc", href: "https://jd.papermc.io" },
        { icon: "discord", label: "Discord", href: "https://discord.gg/PaperMC" },
      ],
      lastUpdated: true,
      editLink: {
        baseUrl: "hhttps://github.com/8aka-Team/PaperMC-Docs-CN/edit/main/",
      },
      customCss: [
        "@fontsource/poppins/400.css",
        // "@fontsource/poppins/600.css", // see src/styles/custom.css
        "@fontsource/jetbrains-mono/400.css",
        "@fontsource/jetbrains-mono/600.css",
        "./src/styles/custom.css",
      ],
      components: {
        Head: "./src/components/overrides/Head.astro",
        SiteTitle: "./src/components/overrides/SiteTitle.astro",
        PageFrame: "./src/components/overrides/PageFrame.astro",
        Footer: "./src/components/overrides/Footer.astro",
        LastUpdated: "./src/components/overrides/LastUpdated.astro",
        Banner: "./src/components/overrides/Banner.astro",
        TableOfContents: "./src/components/overrides/TableOfContents.astro",
        MobileTableOfContents: "./src/components/overrides/MobileTableOfContents.astro",
        SocialIcons: "./src/components/overrides/SocialIcons.astro",
        // stop starlight-sidebar-topics from having its component there
        // we override the topics with our dropdown in PageFrame
        Sidebar: "@astrojs/starlight/components/Sidebar.astro",
      },
      plugins: [
        starlightLinksValidator({
          errorOnInvalidHashes: false, // enable if you want to check hashes - it doesn't work with config diagrams
        }),
        starlightSidebarTopics(
          [
            {
              id: "paper",
              label: "Paper",
              link: "/paper/",
              icon: "paper",
              items: [
                {
                  label: "管理",
                  items: [
                    {
                      label: "开始使用",
                      items: ["paper/getting-started", "paper/adding-plugins", "paper/migration", "paper/next-steps"],
                    },
                    {
                      label: "操作指南",
                      items: [
                        "paper/aikars-flags",
                        "paper/anti-xray",
                        "paper/basic-troubleshooting",
                        "paper/profiling",
                        "paper/updating",
                        "paper/vanilla",
                      ],
                    },
                    {
                      label: "参考",
                      items: [
                        {
                          label: "配置",
                          collapsed: true,
                          items: [
                            "paper/reference/configuration",
                            "paper/reference/global-configuration",
                            "paper/reference/world-configuration",
                            "paper/reference/bukkit-configuration",
                            "paper/reference/spigot-configuration",
                            "paper/reference/bukkit-commands-configuration",
                            "paper/reference/bukkit-permissions-configuration",
                            "paper/reference/bukkit-help-configuration",
                            "paper/reference/server-properties",
                            "paper/reference/vanilla-data-files",
                          ],
                        },
                        "paper/reference/paper-plugins",
                        "paper/reference/system-properties",
                        "paper/reference/permissions",
                      ],
                    },
                    {
                      label: "其他",
                      items: ["paper/misc/paper-bug-fixes", "paper/faq"],
                    },
                  ],
                },
                {
                  label: "开发",
                  items: [
                    {
                      label: "开始使用",
                      items: [
                        "paper/dev/project-setup",
                        "paper/dev/how-do-plugins-work",
                        "paper/dev/getting-started/paper-plugins",
                        "paper/dev/plugin-yml",
                        "paper/dev/userdev",
                      ],
                    },
                    {
                      label: "API",
                      items: [
                        {
                          label: "命令 API",
                          collapsed: true,
                          items: [
                            {
                              label: "基础",
                              items: [
                                "paper/dev/command-api/basics/introduction",
                                "paper/dev/command-api/basics/command-tree",
                                "paper/dev/command-api/basics/arguments-and-literals",
                                "paper/dev/command-api/basics/executors",
                                "paper/dev/command-api/basics/registration",
                                "paper/dev/command-api/basics/requirements",
                                "paper/dev/command-api/basics/argument-suggestions",
                                "paper/dev/command-api/basics/custom-arguments",
                              ],
                            },
                            {
                              label: "参数",
                              items: [
                                "paper/dev/command-api/arguments/minecraft",
                                "paper/dev/command-api/arguments/location",
                                "paper/dev/command-api/arguments/entity-player",
                                "paper/dev/command-api/arguments/registry",
                                "paper/dev/command-api/arguments/paper",
                                "paper/dev/command-api/arguments/enums",
                                "paper/dev/command-api/arguments/predicate",
                                "paper/dev/command-api/arguments/adventure",
                              ],
                            },
                            {
                              label: "其他",
                              items: [
                                "paper/dev/command-api/misc/basic-command",
                                "paper/dev/command-api/misc/comparison-bukkit-brigadier",
                              ],
                            },
                          ],
                        },
                        {
                          label: "组件 API",
                          collapsed: true,
                          items: [
                            "paper/dev/component-api/introduction",
                            "paper/dev/component-api/i18n",
                            "paper/dev/component-api/audiences",
                            "paper/dev/component-api/signed-messages",
                          ],
                        },
                        {
                          label: "事件 API",
                          collapsed: true,
                          items: [
                            "paper/dev/event-listeners",
                            "paper/dev/custom-events",
                            "paper/dev/handler-lists",
                            "paper/dev/chat-events",
                          ],
                        },
                        {
                          label: "实体 API",
                          collapsed: true,
                          items: ["paper/dev/entity-teleport", "paper/dev/display-entities"],
                        },
                        {
                          label: "Inventories",
                          collapsed: true,
                          items: ["paper/dev/menu-type-api", "paper/dev/custom-inventory-holder"],
                        },
                        {
                          label: "Lifecycle API",
                          collapsed: true,
                          items: ["paper/dev/lifecycle", "paper/dev/lifecycle/datapacks"],
                        },
                        "paper/dev/data-component-api",
                        "paper/dev/pdc",
                        "paper/dev/scheduler",
                        "paper/dev/plugin-messaging",
                        "paper/dev/plugin-configurations",
                        "paper/dev/registries",
                        "paper/dev/dialogs",
                        "paper/dev/recipes",
                        "paper/dev/particles",
                        "paper/dev/folia-support",
                        "paper/dev/roadmap",
                      ],
                    },
                    {
                      label: "其他",
                      items: [
                        "paper/dev/using-databases",
                        "paper/dev/debugging",
                        "paper/dev/internals",
                        "paper/dev/reading-stacktraces",
                      ],
                    },
                  ],
                },
                {
                  label: "贡献",
                  items: ["paper/contributing/events"],
                },
              ],
            },
            {
              id: "velocity",
              label: "Velocity",
              link: "/velocity/",
              icon: "velocity",
              items: [
                {
                  label: "管理",
                  items: [
                    {
                      label: "开始使用",
                      items: [
                        "velocity/getting-started",
                        "velocity/why-velocity",
                        "velocity/player-information-forwarding",
                        "velocity/faq",
                      ],
                    },
                    {
                      label: "操作指南",
                      items: ["velocity/tuning", "velocity/security", "velocity/migration"],
                    },
                    {
                      label: "参考",
                      items: [
                        "velocity/configuration",
                        "velocity/reference/system-properties",
                        "velocity/built-in-commands",
                        "velocity/server-compatibility",
                        "velocity/comparisons-to-other-proxies",
                        "velocity/credits",
                      ],
                    },
                  ],
                },
                {
                  label: "开发",
                  items: [
                    {
                      label: "开始使用",
                      items: [
                        "velocity/dev/creating-your-first-plugin",
                        "velocity/dev/api-basics",
                        "velocity/dev/pitfalls",
                      ],
                    },
                    {
                      label: "操作指南",
                      items: ["velocity/dev/dependency-management", "velocity/dev/porting-plugins-from-velocity-1"],
                    },
                    {
                      label: "API",
                      items: [
                        {
                          label: "组件 API",
                          collapsed: true,
                          items: [
                            "paper/dev/component-api/introduction",
                            "paper/dev/component-api/i18n",
                            "paper/dev/component-api/audiences",
                          ],
                        },
                        "velocity/dev/event-api",
                        "velocity/dev/scheduler-api",
                        "velocity/dev/command-api",
                        "velocity/dev/plugin-messaging",
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "folia",
              label: "Folia",
              link: "/folia/",
              icon: "folia",
              items: [
                {
                  label: "管理",
                  items: [
                    {
                      label: "参考",
                      items: ["folia/reference/overview", "folia/reference/region-logic", "folia/faq"],
                    },
                  ],
                },
              ],
            },
            {
              id: "waterfall",
              label: "Waterfall",
              link: "/waterfall/",
              icon: "waterfall",
              items: ["waterfall/getting-started", "waterfall/configuration"],
            },
            {
              id: "adventure",
              label: "Adventure",
              link: "https://docs.advntr.dev/",
              icon: "adventure",
            },
            {
              id: "misc",
              label: "其他",
              link: "/misc/",
              icon: "random",
              items: [
                "misc/assets",
                "misc/contact",
                "misc/downloads-api",
                "misc/hangar-publishing",
                "misc/java-install",
                {
                  label: "工具",
                  items: [
                    "misc/tools/start-script-gen",
                    "misc/tools/item-command-converter",
                    "misc/tools/minimessage-web-editor",
                    "misc/tools/diff-viewer",
                  ],
                },
              ],
            },
          ],
          {
            // pages excluded from sidebars - index.md(x) pages
            topics: {
              paper: [
                "/paper/admin",
                "/paper/admin/getting-started",
                "/paper/admin/how-to",
                "/paper/admin/misc",
                "/paper/admin/reference",
                "/paper/dev",
                "/paper/dev/getting-started",
                "/paper/dev/api",
                "/paper/dev/api/command-api",
                "/paper/dev/api/command-api/arguments",
                "/paper/dev/api/command-api/basics",
                "/paper/dev/api/command-api/misc",
                "/paper/dev/api/component-api",
                "/paper/dev/api/entity-api",
                "/paper/dev/api/inventories",
                "/paper/dev/api/lifecycle",
                "/paper/dev/api/event-api",
                "/paper/dev/misc",
                "/paper/contributing",
              ],
              velocity: [
                "/velocity/admin",
                "/velocity/admin/getting-started",
                "/velocity/admin/how-to",
                "/velocity/admin/reference",
                "/velocity/dev",
                "/velocity/dev/getting-started",
                "/velocity/dev/how-to",
                "/velocity/dev/api",
              ],
              folia: ["/folia/admin", "/folia/admin/reference"],
              waterfall: ["/waterfall"],
              misc: ["/misc", "/misc/tools"],
            },
          }
        ),
      ],
      expressiveCode: {
        plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
        defaultProps: {
          showLineNumbers: false,
          collapseStyle: "collapsible-start",
        },
        frames: {
          extractFileNameFromCode: false,
        },
        emitExternalStylesheet: false,
      },
    }),
    svelte(),
    d2({
      pad: 50,
      skipGeneration: !prod, // comment out if you have D2 locally and want to use it during dev
    }),
  ],
  build: {
    inlineStylesheets: "always",
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  markdown: {
    remarkPlugins: [
      [
        javadocPlugin,
        {
          targets: {
            paper: `https://jd.papermc.io/paper/${LATEST_PAPER_RELEASE}`,
            velocity: `https://jd.papermc.io/velocity/${LATEST_VELOCITY_RELEASE.substring(0, LATEST_VELOCITY_RELEASE.lastIndexOf("."))}.0`,
            java: { url: "https://docs.oracle.com/en/java/javase/21/docs/api", module: "java.base" },
          },
        },
      ],
      [
        codeConstantsPlugin,
        {
          constants: {
            LATEST_MC_RELEASE,
            LATEST_PAPER_RELEASE,
            LATEST_VELOCITY_RELEASE,
            LATEST_FOLIA_RELEASE,
            LATEST_WATERFALL_RELEASE,
            LATEST_USERDEV_RELEASE,
          },
        },
      ],
    ],
  },
});
