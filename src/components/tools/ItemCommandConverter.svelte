<script lang="ts" module>
  type Option = { label: string; value: string; description?: string };

  const modes: Option[] = [
    { label: "命令", value: "command" },
    { label: "物品参数", value: "item-argument" },
    { label: "组件参数", value: "component-argument" },
    { label: "实体参数", value: "entity-argument" },
  ];

  const entityTypes: Option[] = [
    "item",
    "xp_orb",
    "area_effect_cloud",
    "elder_guardian",
    "wither_skeleton",
    "stray",
    "egg",
    "leash_knot",
    "painting",
    "arrow",
    "snowball",
    "fireball",
    "small_fireball",
    "ender_pearl",
    "eye_of_ender_signal",
    "potion",
    "xp_bottle",
    "item_frame",
    "wither_skull",
    "tnt",
    "falling_block",
    "fireworks_rocket",
    "husk",
    "spectral_arrow",
    "shulker_bullet",
    "dragon_fireball",
    "zombie_villager",
    "skeleton_horse",
    "zombie_horse",
    "armor_stand",
    "donkey",
    "mule",
    "evocation_fangs",
    "evocation_illager",
    "vex",
    "vindication_illager",
    "illusion_illager",
    "commandblock_minecart",
    "boat",
    "minecart",
    "chest_minecart",
    "furnace_minecart",
    "tnt_minecart",
    "hopper_minecart",
    "spawner_minecart",
    "creeper",
    "skeleton",
    "spider",
    "giant",
    "zombie",
    "slime",
    "ghast",
    "zombie_pigman",
    "enderman",
    "cave_spider",
    "silverfish",
    "blaze",
    "magma_cube",
    "ender_dragon",
    "wither",
    "bat",
    "witch",
    "endermite",
    "guardian",
    "shulker",
    "pig",
    "sheep",
    "cow",
    "chicken",
    "squid",
    "wolf",
    "mooshroom",
    "snowman",
    "ocelot",
    "villager_golem",
    "horse",
    "rabbit",
    "polar_bear",
    "llama",
    "llama_spit",
    "parrot",
    "villager",
    "ender_crystal",
  ]
    .map((e) => ({ label: e, value: e }))
    .sort((e1, e2) => e1.label.localeCompare(e2.label));

  type State = "完成" | "错误" | "加载" | "空闲";
</script>

<script lang="ts">
  let convState = $state<State>("空闲");
  let input = $state("");
  let output = $state("");

  let copied = $state(false);
  $effect(() => {
    if (copied) {
      setTimeout(() => (copied = false), 1500);
    }
  });

  let modeId = $state(modes[0]?.value);
  let mode = $derived<Option>(modes.find((m) => m.value === modeId) ?? modes[0]);
  let entityTypeId = $state(entityTypes[0]?.value);
  let entityType = $derived<Option>(entityTypes.find((m) => m.value === entityTypeId) ?? entityTypes[0]);

  const convert = async () => {
    if (convState === "加载") {
      return;
    }

    convState = "加载";
    output = "正在转换...";
    try {
      const query = mode.value === "entity-argument" ? `?entityType=${entityType!.value}` : "";
      const response = await fetch(`https://item-converter.papermc.io/convert-${mode.value}${query}`, {
        method: "POST",
        body: input,
      });

      if (response.ok) {
        output = await response.text();
        convState = "完成";
      } else {
        output = `命令转换失败。 (${await response.text()})`;
        convState = "错误";
      }
    } catch (e) {
      output = "命令转换失败，请检查控制台。";
      console.error(e);

      convState = "错误";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    copied = true;
  };
</script>

<div class="not-content generator">
  <div class="area">
    <p class="label">输入:</p>
    <textarea placeholder="在这里输入您的 1.20.4 命令..." bind:value={input}></textarea>
  </div>

  <div class="controls">
    <button onclick={convert} disabled={convState === "加载"}>转换</button>
    {#if mode.value === "entity-argument"}
      <div class="dropdown">
        <div class="label">实体类型:</div>
        <select bind:value={entityTypeId} class="dropdown-code">
          {#each entityTypes as option (option.label)}
            <option value={option.value}>{option.label ?? option.value}</option>
          {/each}
        </select>
      </div>
    {/if}
    <div class="dropdown">
      <div class="label">模式:</div>
      <select bind:value={modeId}>
        {#each modes as option (option)}
          <option value={option.value}>{option.label ?? option.value}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="area">
    <p class="label">输出:</p>
    <textarea placeholder="点击“转换”以转换命令。" readonly bind:value={output}></textarea>
  </div>

  <div class="controls">
    <button class:copied onclick={copyToClipboard} disabled={convState !== "完成"}>
      {copied ? "已复制！" : "复制"}
    </button>
  </div>
</div>

<style>
  .generator {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem;
    border: 1px solid var(--sl-color-gray-6);
    border-radius: 0.25rem;
  }

  .label {
    font-weight: 600;
  }

  .area textarea {
    width: 100%;
    resize: none;
    border: none;
    padding: 1rem;
    height: 12rem;
    line-height: 1.6;
    font-size: var(--sl-text-sm);
    font-family: var(--__sl-font-mono);
    word-break: break-all;
    background-color: var(--sl-color-gray-6);
    color: var(--sl-color-gray-1);
  }

  .area .label {
    margin-bottom: 0.25rem;
  }

  .controls {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .dropdown {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
  }

  .dropdown .label {
    flex-shrink: 0;
  }

  .dropdown select {
    height: 3rem;
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.25rem;
    background-color: var(--sl-color-gray-6);
  }

  .dropdown-code {
    font-family: var(--__sl-font-mono);
  }

  .controls button {
    height: 3rem;
    width: 6rem;
    padding: 0.5rem 1rem;
    color: var(--sl-color-white);
    background-color: var(--sl-color-gray-6);
    border: none;
    border-radius: 0.25rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      color 0.2s,
      background-color 0.2s;
  }

  .controls button:hover {
    background-color: var(--sl-color-gray-5);
  }

  .controls button[disabled] {
    cursor: not-allowed;
    color: var(--sl-color-gray-1);
    background-color: var(--sl-color-gray-5);
  }

  .copied {
    color: var(--sl-color-black) !important;
    background-color: var(--sl-color-green) !important;
  }

  @media (max-width: 640px) {
    .controls {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .dropdown {
      gap: 0.5rem;
      flex-direction: column;
      align-items: start;
    }

    .controls button {
      width: inherit;
    }
  }
</style>
