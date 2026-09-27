# VSR-Pro API 接口文档

**版本:** 1.3
**基础地址(Base URL):** `https://vsrpro-gateway.onrender.com`

> **1.3 版新增。** 通过 `model` 字段可选择第二条流水线:`"vsr-flash"` 只放大、不做修复,
> 跑在更便宜的硬件上。已有调用不受影响——不传 `model` 就是现在的流水线、现在的画质。
> 它**不是**无脑提速开关:是否比默认更快取决于源尺寸,而且它不修复画面。
> 详见 [§3.3](#33-post-v1jobs--发起放大任务)。
>
> **1.2 版变更。** 修复阶段换用了新模型。任务快了约 3 倍,同时画面**与旧模型不一致**——
> 更锐利、纹理更多。如果你有已经交付客户确认过的成片,或者会拿渲染结果与留存的参考帧
> 做比对,请重新复核。各阶段耗时字段也随之改名,旧名称仍保留在契约中。详见
> [§3.4](#34-get-v1jobsjob_id--查询任务状态--结果) 与 [§6](#6-错误处理)。
>
> **1.1 版变更。** `resolution: "original"` 不再保持源尺寸,现在按 1080 短边交付;
> `model_parameters` 从"高级覆盖"改为直接拒绝;任务状态新增了渲染路径的报告。
> 详见 [§3.3](#33-post-v1jobs--发起放大任务) 与
> [§3.4](#34-get-v1jobsjob_id--查询任务状态--结果)。

VSR-Pro 是一个视频超分辨率(放大增强)API。你上传源视频、发起放大任务、下载增强后的结果。
所有处理均为**异步**:提交任务后轮询状态,任务完成后再获取输出。

---

## 1. 概览

### 工作流程

整个接口遵循简单的 **上传 → 处理 → 下载** 三步生命周期:

```
  1. POST /v1/uploads   ──►  预签名上传地址 + input_key
  2. PUT  <upload_url>  ──►  你的视频被存入对象存储(直传)
  3. POST /v1/jobs      ──►  job_id
  4. GET  /v1/jobs/{id} ──►  轮询直到 COMPLETED,然后下载 output_url
```

大文件的传输(上传与下载)通过**限时预签名地址直接与对象存储交互**,不经过 API 服务器。
因此无论文件多大,传输都快速可靠。

### 设计原则

- **默认安全**:你不会拿到任何存储或基础设施凭据。所有访问都通过短时效的预签名地址、
  并限定在你自己的账户范围内。
- **相互隔离**:你的输入与输出都以你的账户命名空间隔离。你只能访问自己创建的任务。
- **异步处理**:超分计算量大,任务在后台运行,你通过轮询获取完成状态。

---

## 2. 认证

除 `GET /healthz` 外,每个请求都必须在请求头中携带你的 API Key(Bearer Token):

```
Authorization: Bearer sk_live_你的密钥
```

- 你的 API Key 是**服务端机密**。请像对待密码一样保管:存放在后端的环境变量/密钥管理中,
  **切勿**放入前端/浏览器代码、移动 App 或公开代码仓库。
- 缺失或无效的密钥将返回 **`401 Unauthorized`**。
- 密钥可随时轮换或吊销。如需新增密钥,请联系我们。

> **Web / 浏览器应用**:由于密钥必须保密,你的浏览器前端**不能**直接调用本 API。
> 请通过你自己的后端转发请求(后端持有密钥)。详见
> [§8 在 Web 应用中使用本 API](#8-在-web-应用中使用本-api)。

### 请将预签名 URL 视为机密

API 返回的 `upload_url` 与 `output_url` 是**限时的 bearer 能力**:在过期之前,
**任何拿到该 URL 的人**都能上传到对应对象(上传 URL)或下载对应结果(输出 URL)——
**使用它们不需要 API Key**。请像对待短时效凭据一样处理:

- **不要**记录到日志、长期保存、嵌入到可分享的页面 URL,或转发给不受信任的第三方。
- 尽快使用并让其自然过期(上传:1 小时;输出:24 小时)。
- 若 URL 已过期,请重新申请(上传用 `/v1/uploads`;输出重新轮询 `/v1/jobs/{id}` 获取新地址)。

---

## 3. 接口详情

> **下方 `curl` 示例的准备工作。** 这些示例假设你已设置以下 shell 变量:
>
> ```bash
> export BASE="https://vsrpro-gateway.onrender.com"
> export KEY="sk_live_..."          # 你的 API Key
> ```
>
> 这是一个异步的多步骤流程,后续步骤会用到前面调用返回的值——步骤 3.1 返回的
> `upload_url` 与 `input_key`,以及步骤 3.3 返回的 `job_id`。请在执行下一步前,
> 从每个 JSON 响应中取出它们(例如用 `jq`)。完整可直接运行的脚本见 [§7](#7-端到端示例)。

### 3.1 `POST /v1/uploads` — 申请上传地址

申请一个用于上传源视频的预签名地址。

**请求体**

| 字段           | 类型   | 必填 | 说明                                                         |
| -------------- | ------ | ---- | ------------------------------------------------------------ |
| `filename`     | string | 是   | 原始文件名(1–200 字符)。仅用于生成对象名;扩展名必须是受支持的视频格式。 |
| `content_type` | string | 否   | 上传文件的 MIME 类型,默认 `video/mp4`。                     |

支持的扩展名:`.mp4`、`.mov`、`.mkv`、`.webm`、`.avi`、`.m4v`。

**响应 `200`**

| 字段         | 类型    | 说明                                              |
| ------------ | ------- | ------------------------------------------------- |
| `upload_url` | string  | 预签名地址。用 HTTP `PUT` 把文件上传到这里。      |
| `input_key`  | string  | 已上传对象的标识符,传给 `POST /v1/jobs`。        |
| `max_bytes`  | integer | 允许的最大文件大小(字节)。                      |
| `expires_in` | integer | `upload_url` 的有效秒数。                         |

**示例**

```bash
curl -s -X POST https://vsrpro-gateway.onrender.com/v1/uploads \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"filename":"clip.mp4","content_type":"video/mp4"}'
```

```json
{
  "upload_url": "https://storage.example.com/...&X-Amz-Signature=...",
  "input_key": "gateway/input/acme/8f3c.../clip.mp4",
  "max_bytes": 2147483648,
  "expires_in": 3600
}
```

---

### 3.2 上传文件 — `PUT <upload_url>`

将视频原始字节上传到 `upload_url`。请求头中的 `Content-Type` **必须与**步骤 3.1 中声明的
`content_type` 一致。

```bash
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: video/mp4" \
  --upload-file clip.mp4
```

上传成功返回 HTTP `200`。该请求直接发往对象存储,**不需要**携带你的 API Key。

---

### 3.3 `POST /v1/jobs` — 发起放大任务

对已上传的视频开始处理。

**请求体**

| 字段               | 类型   | 必填 | 说明                                                     |
| ------------------ | ------ | ---- | -------------------------------------------------------- |
| `input_key`        | string | 是   | `POST /v1/uploads` 返回的 `input_key`。                  |
| `resolution`       | string | 否   | 交付预设:`"1080p"` 或 `"4k"`。`"original"` 仍被接受,但现在交付的是 1080p,见下。省略时默认为 `"4k"`。 |
| `model`            | string | 否   | 由哪条流水线渲染:`"vsr-combined"` 或 `"vsr-flash"`。默认 `"vsr-combined"`,见下。 |
| `model_parameters` | object | 否   | **已不再接受。** 传入非空对象会返回 `400`,见下。 |

**`resolution` 预设**

| 取值         | 效果                                                     |
| ------------ | -------------------------------------------------------- |
| `"1080p"`    | 短边 1080 像素。16:9 的源交付为 1920×1080。              |
| `"4k"`       | 短边 2160 像素。16:9 的源交付为 3840×2160。*(默认)*    |
| `"original"` | `"1080p"` 的兼容别名,已废弃。见下方说明。               |

预设设定的是输出的**短边**,而不是边界框。宽高比始终保持不变,长边由源视频决定,
因此**输出可能比预设名字暗示的尺寸更宽或更高**——2.39:1 的源在 `"1080p"` 下宽度是
2582 像素,而不是 1920。视频不会被拉伸。

预设是目标值而非下限:4K 的源请求 `"1080p"` 时会被交付为 1920×1080,比进来时更小。

| 源尺寸    | `"1080p"` | `"4k"`    |
| --------- | --------- | --------- |
| 3840×2160 | 1920×1080 | 3840×2160 |
| 1920×1080 | 1920×1080 | 3840×2160 |
| 1280×720  | 1920×1080 | 3840×2160 |
| 720×1280  | 1080×1920 | 2160×3840 |
| 1000×1000 | 1080×1080 | 2160×2160 |
| 1920×803  | 2582×1080 | 5164×2160 |

> **`"original"` 在 1.1 中改变了含义。** 它过去交付源视频自身的尺寸,现在按 1080
> 短边交付,与 `"1080p"` 完全相同。原先返回 2160 的 4K 源现在返回 1080,原先返回
> 540 的 540p 源现在返回 1080。保留它只是为了让已有调用不中断——现在**没有任何预设
> 表示"保持输入尺寸"**,请显式指定你想要的尺寸。

**`model_parameters` 已不再接受**

`output_width`、`output_height`、`target_resolution` 已被 `resolution` 取代。
传入非空的 `model_parameters` 会被**拒绝而不是忽略**——一个都不生效却报告成功,
是比报错更糟的结果:

```json
{ "detail": "model_parameters is no longer accepted (target_resolution were superseded); use resolution instead, one of ['1080p', '4k', 'original']" }
```

**`model` — 由哪条流水线渲染**

| 取值              | 作用                                       |
| ----------------- | ------------------------------------------ |
| `"vsr-combined"`  | 先修复画面,再放大。*(默认)*              |
| `"vsr-flash"`     | 只放大,不做修复。                         |

两者差的是一个**阶段**,而不是一档画质选项。`vsr-combined` 会先跑修复模型,压缩伪影、
噪点和糊都是这一步去掉的;`vsr-flash` 跳过它,直接对拿到的画面重采样。干净的源只是需要
更多像素时,两条路出来的结果接近;**带明显伪影的源在 `vsr-flash` 下会带着同样的伪影被放大**。

`vsr-flash` 跑在更便宜的硬件上(RTX 4090 而非 H100),每分钟成片成本约为默认的
三分之一;而且因为它跳过修复阶段,**也是两者中更快的那个**——在所测尺寸上大致是
`vsr-combined` 吞吐的 ~2 倍。以下为热 worker 上的近似吞吐(用合成的 150 帧测试片实测,
真实素材会有出入):

| 源尺寸    | `resolution` | `vsr-combined` | `vsr-flash` |
| --------- | ------------ | -------------- | ----------- |
| 1920×1080 | `"4k"`       | 约 4.9 fps     | 约 13.5 fps |
| 960×540   | `"1080p"`    | 约 14.7 fps    | 约 32.9 fps |
| 400×400   | `"1080p"`    | 约 24.1 fps    | 约 32.1 fps |

所以选择的关键是**画质而非速度**:源本身干净、只需要更多像素时用 `vsr-flash`;源带有
压缩伪影、噪点或模糊、需要先修复再放大时用 `vsr-combined`——用 `vsr-flash` 处理劣质源
只会把同样的瑕疵原样放大。

如果网关未配置 flash endpoint,`"vsr-flash"` 会返回 `503` 而不是退回默认流水线——
静默退回意味着按默认流水线的价格,给一个明确要求不用它的请求计费。

**响应 `200`**

| 字段     | 类型   | 说明                                   |
| -------- | ------ | -------------------------------------- |
| `job_id` | string | 任务唯一标识,用于轮询状态。           |
| `status` | string | 初始状态,通常为 `IN_QUEUE`。          |

**示例**

```bash
curl -s -X POST https://vsrpro-gateway.onrender.com/v1/jobs \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"input_key":"gateway/input/acme/8f3c.../clip.mp4","resolution":"4k"}'
```

```json
{ "job_id": "1b853671-f907-49b7-b398-44d59981e47e", "status": "IN_QUEUE" }
```

**错误**

| 状态码 | 含义                                  |
| ------ | ------------------------------------- |
| `400`  | `resolution` 或 `model` 取值无法识别,或 `model_parameters` 非空。 |
| `403`  | `input_key` 不属于你的账户。          |
| `404`  | 未找到输入对象——请先上传。            |
| `413`  | 输入超过允许的最大大小。              |
| `503`  | 请求的 `model` 未在本网关上配置。     |

---

### 3.4 `GET /v1/jobs/{job_id}` — 查询任务状态 / 结果

轮询该接口,直到任务进入终态。

**响应 `200`**

| 字段                | 类型    | 说明                                                                 |
| ------------------- | ------- | -------------------------------------------------------------------- |
| `job_id`            | string  | 任务标识。                                                           |
| `status`            | string  | 取值:`IN_QUEUE`、`IN_PROGRESS`、`COMPLETED`、`FAILED`、`CANCELLED`、`TIMED_OUT`。 |
| `output_url`        | string  | *(成功时)* 下载增强后视频的预签名地址。                            |
| `output_expires_in` | integer | *(成功时)* `output_url` 的有效秒数。                               |
| `error`             | string  | *(失败时)* 可读的错误信息。                                         |
| `model`             | string  | 实际运行的流水线:`"vsr-combined"` 或 `"vsr-flash"`,与请求中的 `model` 一致。 |
| `target`            | string  | 实际执行的预设:`"1080p"` 或 `"4k"`。                                |
| `target_short_edge` | integer | 输出交付时的短边像素值。                                             |
| `source`            | object  | worker 探测到的输入 `width`、`height`、`frames`。                    |
| `frames`            | integer | 帧数,在顶层重复一份。                                               |
| `seconds`           | number  | worker 上的渲染耗时,**不含**排队时间。                              |
| `fps`               | number  | `frames / seconds`。                                                 |
| `route`             | string  | 实际走的渲染路径,见下。                                             |
| `stage1_base`       | integer | 修复阶段所工作的短边。                                               |
| `vsr_pro_base`      | integer | `stage1_base` 的旧名称,**现在恒为 `null`**,见下。                  |
| `stages`            | object  | 各阶段明细,见下。                                                   |

**`stages`** 是渲染耗时的拆解。其中一项是阶段名称,其余是以秒为单位的耗时:

| 键           | 类型   | 含义                                                          |
| ------------ | ------ | ------------------------------------------------------------- |
| `stage1`     | string | 实际运行的修复模型,目前恒为 `"fast"`。                        |
| `stage1_s`   | number | 修复阶段耗时。                                                 |
| `proteus_s`  | number | 2× 放大耗时。`1080p:direct` 不做放大,该项不出现。             |
| `fit_s`      | number | 将结果贴合到精确目标尺寸的耗时。                               |
| `vsr_pro_s`  | number | `stage1_s` 的旧名称,**已不再下发**,见下。                    |

> **请读 `stage1_s`,不要读 `vsr_pro_s`。** 1.2 之前修复阶段只有一个模型,所以它的
> 耗时用了一个写死模型名的字段名。现在不止一个,`stage1`/`stage1_s` 报告的是实际
> 跑的那个。`vsr_pro_s` 与 `vsr_pro_base` 保留在契约里,是为了让仍在解析它们的客户端
> 不至于报错;但在当前路径下它们分别是"不出现"和 `null`。只读旧字段的客户端会拿到
> 一份只有放大耗时、没有修复耗时的拆解——而修复才是渲染的大头。

**`route`** 说明任务实际走了哪条路径。修复阶段先在 `stage1_base` 上运行,
路径需要时再做一次 2× 放大:

| 取值                | 含义                                                          |
| ------------------- | ------------------------------------------------------------- |
| `4k:1080base+2x`    | 在 1080 上修复,再 2× 放大到 2160 短边。所有 `4k` 任务都走这条。 |
| `1080p:direct`      | 源短边本就 ≥1080,在 1080 上修复,不做放大。                   |
| `1080p:<n>base+2x`  | 源短边为 `<n>`(低于 1080),在该尺寸上修复后 2× 放大。         |

这几个字段仅供参考——交付的文件由 `target_short_edge` 和视频本身完整描述。
提供它们是为了让一个偏慢的任务能被归因到具体阶段,而不是靠猜。

> **`vsr-flash` 任务不会返回 `route`、`stages`、`stage1_base` 和 `vsr_pro_base`。**
> 这些字段描述的是两阶段渲染,而 flash 只有一个阶段——没有修复基底可报告,也没有
> 可以拆分归因的耗时。此时 `seconds` 和 `fps` 覆盖整个渲染。请把这几个键当作
> **可选字段**来解析,而不是按 `model` 分支处理,这样两条流水线返回的任务可以用
> 同一套代码解析。

**示例(处理中)**

```json
{ "job_id": "1b853671-...", "status": "IN_PROGRESS" }
```

**示例(已完成)**

```json
{
  "job_id": "1b853671-...",
  "status": "COMPLETED",
  "output_url": "https://storage.example.com/...&X-Amz-Signature=...",
  "output_expires_in": 86400,
  "model": "vsr-combined",
  "target": "4k",
  "target_short_edge": 2160,
  "source": { "width": 640, "height": 360, "frames": 300 },
  "frames": 300,
  "seconds": 58.8,
  "fps": 5.099,
  "route": "4k:1080base+2x",
  "stage1_base": 1080,
  "vsr_pro_base": null,
  "stages": {
    "stage1": "fast",
    "stage1_s": 40.5,
    "proteus_s": 18.19,
    "fit_s": 0
  }
}
```

**示例(已完成,`model: "vsr-flash"`)**

结构相同,只是少了两阶段相关的字段:

```json
{
  "job_id": "1110e2d7-...",
  "status": "COMPLETED",
  "output_url": "https://storage.example.com/...&X-Amz-Signature=...",
  "output_expires_in": 86400,
  "model": "vsr-flash",
  "target": "4k",
  "target_short_edge": 2160,
  "source": { "width": 1920, "height": 1080, "frames": 100 },
  "frames": 100,
  "seconds": 13.2,
  "fps": 7.559
}
```

请在 `output_url` 过期前下载结果。若已过期,只需再次轮询即可获得新的地址
(在任务记录保留期内)。

**错误**

| 状态码 | 含义                                  |
| ------ | ------------------------------------- |
| `404`  | 任务不存在,或不属于你的账户。        |

---

### 3.5 `GET /healthz` — 存活检查

无需认证的健康检查。

```bash
curl -s https://vsrpro-gateway.onrender.com/healthz
# {"status":"ok"}
```

---

## 4. 任务状态生命周期

```
IN_QUEUE ──► IN_PROGRESS ──► COMPLETED   (成功;包含 output_url)
                         └─► FAILED / CANCELLED / TIMED_OUT   (见 error 字段)
```

只有当 `status == "COMPLETED"` **且**不含 `error` 字段时,任务才算成功。即使返回 `200`,
也请始终检查是否存在 `error`。

---

## 5. 使用限制

| 限制项            | 取值          | 超限时的表现                     |
| ----------------- | ------------- | -------------------------------- |
| 最大上传大小      | 2 GiB         | `413 Payload Too Large`          |
| 输入视频最大时长  | 600 秒        | 任务失败并返回 `error`           |
| 请求频率          | 30 次 / 分钟  | `429 Too Many Requests`          |
| 每个模型并发任务  | 最多 3 个     | 多出的任务排队,直到有 worker 空闲 |
| 上传地址有效期    | 1 小时        | 通过 `/v1/uploads` 重新申请      |
| 输出地址有效期    | 24 小时       | 重新轮询 `/v1/jobs/{id}` 获取新地址 |

限制可按账户调整。如需更高额度,请联系我们。

---

## 6. 错误处理

错误使用标准 HTTP 状态码,并返回 JSON 响应体:

```json
{ "detail": "invalid or missing API key" }
```

| 状态码 | 含义                                     |
| ------ | ---------------------------------------- |
| `400`  | 请求有误——不支持的文件扩展名、无法识别的 `resolution` 或 `model`,或非空的 `model_parameters`。 |
| `401`  | 缺失或无效的 API Key。                   |
| `403`  | 资源不属于你的账户。                     |
| `404`  | 资源不存在。                             |
| `413`  | 输入过大。                               |
| `429`  | 触发限流——请退避后重试。                 |
| `502`  | 上游处理错误——请稍后重试。               |
| `503`  | 请求的 `model` 未在本网关上配置。         |

**推荐的客户端行为**

- 每 **5–10 秒**轮询一次 `GET /v1/jobs/{id}`,不要密集空转。
- 遇到 `429` 时采用指数退避。
- 将 `FAILED`/`TIMED_OUT`/`CANCELLED` 以及任何 `error` 字段都视为终态失败。
- 渲染耗时随帧数线性增长。吞吐取决于走哪条路径,而路径由源尺寸和目标共同决定——
  以下是在热 worker 上的实测值:

  | 源尺寸     | `resolution` | 路径                | 吞吐       |
  | ---------- | ------------ | ------------------- | ---------- |
  | 640×360    | `"4k"`       | `4k:1080base+2x`    | 约 5.1 fps |
  | 640×360    | `"1080p"`    | `1080p:540base+2x`  | 约 16.6 fps|
  | 1920×1080  | `"1080p"`    | `1080p:direct`      | 约 5.9 fps |

  修复阶段约占渲染耗时的 70%,而它的开销跟着 `stage1_base` 走,不是跟着交付尺寸走。
  这就是为什么上表里两行都在 5–6 fps,输出像素却差三倍:它们都在 1080 基底上修复。
  小尺寸源要 `"1080p"` 时只在 540 上修复,所以快得多。**请按源尺寸估算,不要按预设估算。**

  `vsr-flash` 不返回路径字段;它跳过修复阶段,吞吐大致是 `vsr-combined` 的 ~2 倍——见
  [§3.3](#33-post-v1jobs--发起放大任务) 中的对照表。
- **冷启动。** 两条流水线在空闲约 30 秒后都会缩到 0,所以当没有热 worker 时提交的任务
  需要先等一个 worker 启动——实测首个任务的 wall(总耗时)约 120–235 秒(排队 + 模型
  加载),之后连续提交的任务就都是热运行。在 `vsr-combined` 上,加载还会把首个任务的
  计算 `fps` 大致砍半(例如 4K 下约 2.4 vs 约 4.9 fps);在 `vsr-flash` 上,计算 `fps`
  冷热几乎相同,只是 wall 更长。等待时间在耗时字段中单独报告,所以 `IN_QUEUE` 停留
  一两分钟是正常的,不是卡住。

---

## 7. 端到端示例

### 7.1 Python

```python
import os, time, requests

BASE = "https://vsrpro-gateway.onrender.com"
KEY  = os.environ["VSRPRO_KEY"]            # 从环境变量读取;不要把密钥硬编码进代码
H    = {"Authorization": f"Bearer {KEY}"}

# 1) 申请上传地址
up = requests.post(f"{BASE}/v1/uploads", headers=H,
                   json={"filename": "clip.mp4", "content_type": "video/mp4"})
up.raise_for_status()
up = up.json()

# 2) 上传文件(Content-Type 必须一致)
with open("clip.mp4", "rb") as f:
    requests.put(up["upload_url"], data=f,
                 headers={"Content-Type": "video/mp4"}).raise_for_status()

# 3) 发起任务。resolution: "1080p" | "4k"
#    ("original" 是 "1080p" 的废弃别名,已不再保持源尺寸)
#    加上 "model": "vsr-flash" 可跳过修复阶段、只做放大
job = requests.post(f"{BASE}/v1/jobs", headers=H,
                    json={"input_key": up["input_key"], "resolution": "4k"})
job.raise_for_status()
job_id = job.json()["job_id"]

# 4) 轮询直到完成,然后下载
while True:
    s = requests.get(f"{BASE}/v1/jobs/{job_id}", headers=H).json()
    status = s["status"]
    if status == "COMPLETED" and not s.get("error"):
        r = requests.get(s["output_url"], stream=True); r.raise_for_status()
        with open("upscaled.mp4", "wb") as out:
            for chunk in r.iter_content(1 << 20):
                out.write(chunk)
        print("已保存 upscaled.mp4")
        break
    if s.get("error") or status in ("FAILED", "CANCELLED", "TIMED_OUT"):
        raise RuntimeError(f"任务失败: {s}")
    time.sleep(10)
```

### 7.2 JavaScript(Node 18+)

```javascript
import fs from "node:fs";

const BASE = "https://vsrpro-gateway.onrender.com";
const KEY  = process.env.VSRPRO_KEY;                 // 不要硬编码
const H    = { Authorization: `Bearer ${KEY}` };

// 1) 申请上传地址
const up = await (await fetch(`${BASE}/v1/uploads`, {
  method: "POST",
  headers: { ...H, "Content-Type": "application/json" },
  body: JSON.stringify({ filename: "clip.mp4", content_type: "video/mp4" }),
})).json();

// 2) 上传文件
await fetch(up.upload_url, {
  method: "PUT",
  headers: { "Content-Type": "video/mp4" },
  body: fs.readFileSync("clip.mp4"),
});

// 3) 发起任务
const { job_id } = await (await fetch(`${BASE}/v1/jobs`, {
  method: "POST",
  headers: { ...H, "Content-Type": "application/json" },
  // "1080p" | "4k";"original" 是 "1080p" 的废弃别名
  body: JSON.stringify({ input_key: up.input_key, resolution: "4k" }),
})).json();

// 4) 轮询直到完成
while (true) {
  const s = await (await fetch(`${BASE}/v1/jobs/${job_id}`, { headers: H })).json();
  if (s.status === "COMPLETED" && !s.error) {
    const buf = Buffer.from(await (await fetch(s.output_url)).arrayBuffer());
    fs.writeFileSync("upscaled.mp4", buf);
    console.log("已保存 upscaled.mp4");
    break;
  }
  if (s.error || ["FAILED", "CANCELLED", "TIMED_OUT"].includes(s.status)) {
    throw new Error(`任务失败: ${JSON.stringify(s)}`);
  }
  await new Promise((r) => setTimeout(r, 10_000));
}
```

---

## 8. 在 Web 应用中使用本 API

你的 API Key 绝不能下发到浏览器。如果你在开发 Web 应用,请在自己的后端放一个轻量代理,
把密钥保存在后端:

```
浏览器 ──► 你的后端(持有 API Key) ──► VSR-Pro API
```

后端负责转发这三个调用(`/v1/uploads`、`/v1/jobs`、`/v1/jobs/{id}`)并把结果返回给浏览器。
随后浏览器**直接**上传到 `upload_url`、从 `output_url` 下载(这些预签名地址不含任何机密)。
如果由浏览器直接执行上传/下载,请确保对象存储的 CORS 策略允许你的 Web 源(origin)进行
`PUT` 与 `GET`。

---

## 9. 支持与版本

- 本文档描述 **API v1** 的 1.3 修订版。至今没有任何一个修订版对请求或响应的
  **结构**做过不兼容改动,所以它们共用同一个 `v1` 前缀——但其中两次改动了行为,
  且调用方无法从响应内容上察觉:
  - **1.1** 重新定义了 `resolution: "original"`,并开始拒绝 `model_parameters`。
  - **1.2** 更换了修复模型。同一输入的输出不再与 1.1 逐位一致,肉眼看也不一致;
    `stages.vsr_pro_s` 不再下发,改为 `stages.stage1_s`。

  这两项对依赖旧行为的调用方都是破坏性的——所以在文档开头单独标注,而不是只靠一次
  版本号变更来传达。
  - **1.3** 新增了可选的 `model` 字段和第二条流水线。这次是**增量式**的:不传
    `model` 的请求得到的和 1.2 完全一样。唯一的结构变化是 `model` 为 `"vsr-flash"`
    时不返回 `route`、`stages`、`stage1_base` 和 `vsr_pro_base`,已经把它们当作
    可选字段处理的调用方不会受影响。
- 请求或响应**结构**上的不兼容变更,会以新的版本前缀发布。
- 如需新增密钥、更高额度或接入支持,请联系你的 VSR-Pro 对接人。

---

## 附:本仓库中的实现

这份文档对应的前端实现在本仓库里:

| 位置 | 作用 |
| ---- | ---- |
| `lib/vsrpro.ts` | 同构的契约层——枚举、§5 的限制、短边输出尺寸推算、响应类型、终态判定。 |
| `lib/vsrpro-server.ts` | `server-only`。唯一接触 `VSRPRO_API_KEY` 的地方,注入 Bearer 头并在转发前校验入参。 |
| `app/api/vsrpro/uploads/route.ts` | 代理 `POST /v1/uploads`。 |
| `app/api/vsrpro/jobs/route.ts` | 代理 `POST /v1/jobs`。 |
| `app/api/vsrpro/jobs/[jobId]/route.ts` | 代理 `GET /v1/jobs/{job_id}`,被控制台每 6 秒轮询。 |
| `app/api/vsrpro/health/route.ts` | 代理 `GET /healthz`。 |
| `app/private-demos/vsr-pro/page.tsx` | admin 鉴权 + noindex 的页面外壳。 |
| `app/private-demos/vsr-pro/console.tsx` | 控制台 UI。 |

按 §8 的要求,浏览器只调用同源的 `/api/vsrpro/*`;两段大文件传输(`PUT upload_url`、
`GET output_url`)由浏览器直连对象存储,不经过我们的服务器。

需要的环境变量:

```bash
VSRPRO_API_KEY=sk_live_...                              # 必填,服务端机密
VSRPRO_BASE_URL=https://vsrpro-gateway.onrender.com     # 可选,覆盖默认基础地址
```

由于浏览器直连对象存储做 `PUT`/`GET`,存储桶的 CORS 必须放行部署站点的 origin,
并允许 `PUT` 与 `GET`(以及 `Content-Type` 请求头)。
