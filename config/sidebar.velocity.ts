import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const velocity: SidebarsConfig = {
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
            type: "doc",
            id: "admin/getting-started/README",
          },
          items: [
            {
              type: "ref",
              id: "admin/getting-started/README",
            },
            "admin/getting-started/why-velocity",
            "admin/getting-started/forwarding",
            "admin/getting-started/faq",
          ],
        },
        {
          type: "category",
          label: "操作指南",
          link: {
            type: "generated-index",
            slug: "/cat/admin/how-to-guides",
          },
          items: ["admin/how-to/security", "admin/how-to/tuning", "admin/how-to/migration"],
        },
        {
          type: "category",
          label: "参考",
          link: {
            type: "generated-index",
            slug: "/cat/admin/reference",
          },
          items: [
            "admin/reference/configuration",
            "admin/reference/system-properties",
            "admin/reference/commands",
            "admin/reference/server-compatibility",
            "admin/reference/comparison",
            "admin/reference/libraries",
          ],
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
          link: {
            type: "generated-index",
            slug: "/cat/dev/getting-started",
          },
          items: [
            "dev/getting-started/creating-your-first-plugin",
            "dev/getting-started/api-basics",
            "dev/getting-started/pitfalls",
          ],
        },
        {
          type: "category",
          label: "操作指南",
          link: {
            type: "generated-index",
            slug: "/cat/dev/how-to-guides",
          },
          items: ["dev/how-to/dependencies", "dev/how-to/porting-from-velocity-1"],
        },
        {
          type: "category",
          label: "API",
          link: {
            type: "generated-index",
            slug: "/cat/dev/api",
          },
          items: [
            {
              type: "category",
              label: "组件 API (Adventure)",
              collapsed: true,
              items: [
                "dev/api/component-api/intro",
                "dev/api/component-api/i18n",
                "dev/api/component-api/audiences",
              ],
            },
            "dev/api/event",
            "dev/api/command",
            "dev/api/scheduler",
            "dev/api/plugin-messaging",
          ],
        },
      ],
    },
  ],
};

export default velocity;
