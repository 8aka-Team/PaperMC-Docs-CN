import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const paper: SidebarsConfig = {
  primary: [
    "README",
    {
      type: "category",
      label: "管理",
      collapsed: true,
      link: {
        type: "doc",
        id: "admin/README",
      },
      items: [
        {
          type: "category",
          label: "入门",
          link: {
            type: "generated-index",
            slug: "/cat/admin/getting-started",
          },
          items: [
            "admin/getting-started/getting-started",
            "admin/getting-started/setup-next-steps",
            "admin/getting-started/adding-plugins",
            "admin/getting-started/migration",
          ],
        },
        {
          type: "category",
          label: "操作指南",
          link: {
            type: "generated-index",
            slug: "/cat/admin/how-to-guides",
          },
          items: [
            "admin/how-to/basic-troubleshooting",
            "admin/how-to/update",
            "admin/how-to/profiling",
            "admin/how-to/aikars-flags",
            "admin/how-to/anti-xray",
            "admin/how-to/get-to-vanilla",
          ],
        },
        {
          type: "category",
          label: "参考",
          link: {
            type: "generated-index",
            slug: "/cat/admin/reference",
          },
          items: [
            {
              type: "category",
              label: "配置",
              link: {
                type: "doc",
                id: "admin/reference/configuration/README",
              },
              items: [
                "admin/reference/configuration/global-configuration",
                "admin/reference/configuration/world-configuration",
                "admin/reference/configuration/server-properties",
                "admin/reference/configuration/spigot-configuration",
                "admin/reference/configuration/bukkit-configuration",
                "admin/reference/configuration/bukkit-commands-configuration",
              ],
            },
            "admin/reference/system-properties",
            "admin/reference/paper-plugins",
            "admin/reference/vanilla-command-permissions",
          ],
        },
        {
          type: "category",
          label: "杂项",
          link: {
            type: "generated-index",
            slug: "/cat/admin/misc",
          },
          items: ["admin/misc/faq", "admin/misc/paper-bug-fixes"],
        },
      ],
    },
    {
      type: "category",
      label: "开发",
      collapsed: true,
      link: {
        type: "doc",
        id: "dev/README",
      },
      items: [
        {
          type: "category",
          label: "入门",
          collapsed: true,
          link: {
            type: "doc",
            id: "dev/getting-started/README",
          },
          items: [
            "dev/getting-started/project-setup",
            "dev/getting-started/plugin-yml",
            "dev/getting-started/how-do-plugins-work",
            "dev/getting-started/paper-plugins",
            "dev/getting-started/userdev",
          ],
        },
        {
          type: "category",
          label: "API",
          collapsed: true,
          link: {
            type: "doc",
            id: "dev/api/README",
          },
          items: [
            {
              type: "category",
              label: "事件 API",
              collapsed: true,
              items: [
                "dev/api/event-api/event-listeners",
                "dev/api/event-api/custom-events",
                "dev/api/event-api/handler-lists",
                "dev/api/event-api/chat-event",
              ],
            },
            {
              type: "category",
              label: "Brigadier 命令 API",
              collapsed: true,
              items: [
                {
                  type: "category",
                  label: "基础",
                  collapsed: true,
                  items: [
                    "dev/api/command-api/basics/introduction",
                    "dev/api/command-api/basics/command-tree",
                    "dev/api/command-api/basics/arguments-and-literals",
                    "dev/api/command-api/basics/executors",
                    "dev/api/command-api/basics/registration",
                    "dev/api/command-api/basics/requirements",
                  ],
                },
                {
                  type: "category",
                  label: "参数",
                  collapsed: true,
                  items: [
                    "dev/api/command-api/arguments/minecraft",
                    "dev/api/command-api/arguments/location",
                    "dev/api/command-api/arguments/entity-player",
                    "dev/api/command-api/arguments/registry",
                    "dev/api/command-api/arguments/paper",
                    "dev/api/command-api/arguments/enums",
                    "dev/api/command-api/arguments/predicate",
                    "dev/api/command-api/arguments/adventure",
                  ],
                },
                {
                  type: "category",
                  label: "其他",
                  collapsed: true,
                  items: [
                    "dev/api/command-api/misc/comparison-bukkit-brigadier",
                    "dev/api/command-api/misc/basic-command",
                  ],
                },
              ],
            },
            {
              type: "category",
              label: "实体 API",
              collapsed: true,
              items: ["dev/api/entity-api/entity-teleport", "dev/api/entity-api/display-entities"],
            },
            {
              type: "category",
              label: "文本组件 API (Adventure)",
              collapsed: true,
              items: [
                "dev/api/component-api/intro",
                "dev/api/component-api/i18n",
                "dev/api/component-api/audiences",
              ],
            },
            "dev/api/data-component-api",
            "dev/api/pdc",
            "dev/api/custom-inventory-holder",
            "dev/api/scheduler",
            "dev/api/plugin-messaging",
            "dev/api/plugin-configs",
            "dev/api/lifecycle",
            "dev/api/registries",
            "dev/api/recipes",
            "dev/api/folia-support",
            "dev/api/roadmap",
          ],
        },
        {
          type: "category",
          label: "杂项",
          collapsed: true,
          link: {
            type: "doc",
            id: "dev/misc/README",
          },
          items: [
            "dev/misc/reading-stacktraces",
            "dev/misc/debugging",
            "dev/misc/databases",
            "dev/misc/internal-code",
          ],
        },
        {
          type: "category",
          label: "贡献",
          collapsed: true,
          link: {
            type: "doc",
            id: "contributing/README",
          },
          items: ["contributing/events"],
        },
      ],
    },
  ],
};

export default paper;
