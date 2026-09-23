# galgame-xitongge

系统哥的末日 · 前端界面（SillyTavern 卡「系统哥的末日」的状态栏 / 交涉面板 / 评论条）。

## 用法

卡内 `正则/状态栏界面.html` 是 loader，指向：

```
https://testingcf.jsdelivr.net/gh/fkgzs123321/galgame-xitongge@<commit>/index.html
```

`<commit>` 换成这里的 commit 号。**必须带 commit** —— 不带会被 jsDelivr 缓存住，改了仓库界面看不到变化。

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | **成品单页**（loader 实际加载的就是它） |
| `状态栏.html` | A 块分件 · 时间 / 评价值档位 / 林天 / 玩家 / 绑定花名册 |
| `交涉.html` | B 块分件 · 共识分 / 骰值对 / 判定 / 四维 / 证据链 |
| `评论.html` | C 块分件 · 倾向 / 热评 |

## 数据来源

面板读的是 MVU 的 `stat_data`，逐级兜底：

1. 从最新楼层往回找最多 15 层，只认 `role === 'assistant'` 的楼层
2. `Mvu.getMvuData({type:'message'})` → `getVariables({type:'message'})`
3. → `getVariables({type:'chat'})`
4. → 静态 `{{format_message_variable::stat_data.…}}`

重绘三通道：`Mvu.eventOn(VARIABLE_UPDATE_ENDED)` 强制重绘 + 酒馆事件（指纹比对后重绘）+ 1.5 秒轮询兜底。

## 生成

`index.html` 是产物，由卡工作区的 `_ui_repo/xitongge` 构建（`src/` 放分件，`build.mjs` 合成，`push.cjs` 推仓库并回填 commit 到卡内 loader）。
**不要手改这个仓库里的 `index.html`**，下次构建会覆盖。
