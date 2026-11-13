I wrote this a long time ago and am moving it over now that I have a personal blog. I hope it helps 🙏
I go through the report in Abstract → Results → Conclusion → Introduction → Methods → Experiments order: first get a feel for how good the model is, then dig into the technical details.
## Abstract
**Why:** Modern AI systems are powered by foundation models, and Llama 3 is the newest of them.
**How:** A family of LLMs that natively support multilinguality, coding, reasoning and tool use. The largest is a dense Transformer with 405B parameters and a context window of up to 128K tokens. The work also releases Llama Guard 3 for input and output safety, and reports experiments that integrate image, video and speech capabilities into Llama 3 through a compositional approach.
**What:** Across a wide range of tasks, Llama 3 delivers quality comparable to leading language models such as GPT-4, and the multimodal integration is competitive with the state of the art on image, video and speech recognition tasks.
## Results
The authors evaluate the model along the following axes:
### Pre-Trained Model
1. Standard benchmarks:
	These cover (1) commonsense reasoning; (2) knowledge; (3) reading comprehension; (4) math, reasoning and problem solving; (5) long context; (6) code; (7) adversarial evaluation; (8) aggregate evaluation.
	![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925182911.png)
	The scores are very competitive with models of the same size.
2. Robustness:
	For example few-shot label bias, label variants, answer order and prompt format;
	![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925183125.png)
	The results suggest Llama 3 understands the semantics and is not very sensitive to these artificial perturbations.
3. Adversarial benchmarks ![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925183252.png)
	Llama is tested on challenging tasks. The chart shows that on math reasoning and question answering, adversarial performance is weaker than non-adversarial performance, which hints at some overfitting to the benchmarks.
4. Contamination analysis
	Checks whether the pre-training data was contaminated by test-set data, and how much that contamination affects model performance.

### Post-Trained Model
1. Proficiency exams
	Llama 3 is made to sit exams. The 405B model performs very similarly to Claude 3.5 Sonnet and GPT-4o. The 70B model clearly beats GPT-3.5 Turbo and beats Nemotron 4 340B on many tests.
2. Coding / multilingual / math and reasoning / tool-use benchmarks
	Again, 405B is on par with GPT-4o.
3. Long-context benchmarks
	**Needle-in-a-Haystack:** four needles are inserted into a long context and the model is tested on retrieving two of them. This measures how well the model retrieves information hidden in random parts of a long document.
	The long-context ability turns out to be excellent.
	![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925184418.png)
4. Human evaluations
	Humans compare and score responses from Llama 3 and GPT. The two perform roughly on par, which shows that SFT and DPO in post-training work.
	![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925184524.png)

5. Safety evaluations
	Data filtering is already applied during pre-training, and safety finetuning is done during post-training. Adversarial prompts are built to test Llama 3's safety. The main metrics are the violation rate (share of responses that break safety rules) and the false refusal rate (share of wrongful refusals).
	The 405B model combined with the trained Llama Guard is fairly safe.
	![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925184553.png)
6. Red teaming
	The Llama team also ran red teaming to attack the model, find weaknesses and keep improving it.

## Conclusion
## Introduction
The Llama 3 foundation models natively support multilinguality, coding, reasoning and tool use. The largest model is 405B with a 128K context. Training mainly improved three things: 1. more and better data; 2. scaling up the model with more training tokens; 3. a dense Transformer architecture, plus post-training with SFT, RS and DPO, which is friendlier to scaling up.
## Overview
This section shows the Llama 3 model architecture:
![Pasted image 20250921162232](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250921162232.png)
The authors describe two training stages:
**Pre-training:** pre-train on a large corpus so the model learns to understand language. It has two phases: the first with an 8K-token context, the second with a 128K-token context.
**Post-training:** several rounds of training align the model with human feedback, mainly through SFT and DPO. Post-training also gives the model tool use, and ends with safety finetuning.

The team also adds modalities on top of the LLM so Llama can handle multimodal input. Multimodal training has three stages:
![Pasted image 20250921163647](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250921163647.png)
**Multimodal encoder pre-training:** adding a modality starts with training an encoder. For images, the team trains the encoder on a large set of image-text pairs so it learns how natural language relates to images. For speech, part of the speech input is masked and the model reconstructs the masked part as discrete tokens in a self-supervised way, learning the structure of speech signals.
**Vision adapter training:** next an adapter is trained to align image tokens with text tokens. The adapter is a series of cross-attention layers trained on image-text pairs. The image encoder's parameters are updated along the way, but the base language model stays frozen. A video adapter is trained as well.
**Speech adapter training:** like the vision adapter, the adapter and encoder are updated jointly during finetuning while the language model stays unchanged. The authors also integrate a text-to-speech system.
## Pre-training
Now the first training stage: pre-training.
### Data collection
**Data preprocessing:**
Most data comes from the web, so it goes through safety filtering → HTML text extraction → deduplication and quality filtering (n-gram, MinHash, KL divergence).
For code and math-reasoning pages, a DistilRoBERTa classifier trained on Llama 2 annotations first classifies them, then each type gets its own filtering.
Multilingual data is handled much the same way, except a language-ID model is added and processing is done per language. During training, the ratio of multilingual to English tokens has to be balanced.
**Data mix:**
The proportions of the training mix matter a lot for model quality. Using the classifiers, overrepresented categories are downsampled first; then small models are trained on different mixes and evaluated to find a good mix.
The final mix: 50% of tokens corresponding to general knowledge, 25% of mathematical and reasoning tokens, 17% code tokens, and 8% multilingual tokens.
**Annealing:**
For the relatively scarce high-quality code and math data, annealing on it boosts performance a lot (mostly for small models; the gain for large models is limited).
The authors also use annealing to judge data quality: take a model that is 50% trained, continue training on a mix of 30% candidate data and 70% original data while linearly decaying the learning rate to 0, and judge the dataset by the resulting model's performance. This is faster than running scaling-law experiments.
### Model architecture
The authors note that Llama 3's architecture differs little from Llama 2. Most of the gains come from data quality, diversity and scale.

<mark>**Question 1: Section 3.2 says "We use grouped query attention (GQA) with 8 key-value heads to improve inference speed and to reduce the size of key-value caches during decoding." How does GQA differ from regular multi-head attention? Why does "reduce the size of key-value caches" matter?**</mark>
*Reference: "Llama 2: Open Foundation and Fine-Tuned Chat Models"*
**About the KV cache:**
An LLM is autoregressive: it predicts the next output from the previous ones. With causal attention, masking hides later tokens during training, and at inference the model likewise doesn't know the future tokens — attention is computed over all the known earlier tokens.
![Pasted image 20250925155256](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925155256.png)
![Pasted image 20250925155340](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925155340.png)
The figure on the left shows that when decoding token by token, the newest $Att_{k}$ depends only on the current $Q_{k}$ and the K and V of all tokens up to that point. This means, first, we don't need to recompute all of attention each step: at inference we only care about the last attention output, which is projected onto the vocabulary, so only that one needs computing. Second, we don't need to recompute K and V for earlier tokens: compute only the new K and V, append them to the cached ones, and attend with the new query.
These cached K and V are the KV cache. It cuts the compute needed and speeds up decoding.

**About GQA:**
![Pasted image 20250831165036](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250831165036.png)
The KV cache trades memory for time, but GPU memory is limited, and as models grow the KV cache grows too. GQA saves memory by sharing KV pairs.
GQA splits the attention heads into x groups, and heads in a group share the same KV pair. With x = 1 it's MQA; with x = number of heads it's MHA. You lose some of the different representations multiple heads would learn, but memory use drops sharply.
The GQA implementation flow looks like this:

<div align='center'>
    <img src="https://raw.githubusercontent.com/datawhalechina/happy-llm/main/docs/images/5-images/llama2-attention.png" alt="alt text" width="50%">
</div>

Looking at the GQA code, the main difference from MHA is in the projection: Q keeps the full number of heads, but K and V are projected to only kv_head heads, and those new K and V are what gets cached. In the forward pass, after adding the positional encoding, the K and V matrices are repeated along the kv_head dimension to fill in the missing heads.
Llama 3 uses GQA with 8 key-value heads, i.e. all heads are split into 8 groups, which shrinks the KV cache considerably and speeds up inference.
**<mark>End of Question 1</mark>**
#### Recap of the Llama 2 architecture
The report doesn't show the Llama 2 architecture, so let's recap it:

<div align='center'>
    <img src="https://raw.githubusercontent.com/datawhalechina/happy-llm/main/docs/images/5-images/LLama2.png" alt="alt text" width="100%">
</div>

Llama 2 is a decoder-only model. The notable parts of each decoder layer are GQA attention, RMSNorm and RoPE.

Llama 3 makes these changes on top of Llama 2:
1. GQA with 8 key-value heads to speed up inference and shrink the KV cache
2. An attention mask that prevents attention between different documents in the same sequence, which helps continued pre-training on very long sequences
3. A new tokenizer with better compression for English and more non-English tokens
4. The RoPE base frequency hyperparameter raised to 500,000 to support longer contexts

**<mark>Why does raising the base frequency support longer contexts?</mark>**
*Reference: https://zhuanlan.zhihu.com/p/642884818*
**About RoPE (rotary position embedding):**
To use the relative position between tokens, assume the inner product between query $q_m$ and key $k_n$ can be written as a function $g$ whose inputs are the embeddings $x_m$, $x_n$ and their relative position $m - n$:
$$
    \langle f_q(x_m, m),\, f_k(x_n, n) \rangle = g(x_m, x_n, m - n)
$$
The goal is to find a positional encoding for which this holds.
Assume the embedding is two-dimensional ($d=2$), so we can use the geometry of vectors in the plane. RoPE proposes the following $f$ and $g$ that satisfy the relation:
$$
\begin{align}
    f_q(x_m, m) &= (W_q x_m) \, e^{i m \theta} \\
    f_k(x_n, n) &= (W_k x_n) \, e^{i n \theta} \\
    g(x_m, x_n, m - n) &= \operatorname{Re}\left[ (W_q x_m) (W_k x_n)^* \, e^{i (m - n) \theta} \right]
\end{align}
$$
A complex rotation angle thus encodes the positional relationship between two vectors.
For the general case $d \geq 2$, the embedding's elements are grouped in pairs, each pair gets the same kind of rotation, and each pair's angle is:
$$
    \theta_j = 10000^{-2(j-1)/d}, \quad j \in \left[1, 2, \dots, \frac{d}{2}\right]
$$

Here $j$ is the $j$-th pair (of $d/2$ pairs); 10000 is the base frequency; the two elements in a pair share the same $\theta_j$ and are rotated by $\cos(m\theta_j)$ and $\sin(m\theta_j)$.
So, in short, self-attention with RoPE works like this: for each token embedding, compute its query and key; for each position $m$, compute the rotary encoding (a rotation matrix applied per dimension pair); apply the rotation pairwise to each token's query and key; finally take the inner product of the rotated query and key to get the attention scores.
Raising the base frequency therefore effectively shrinks $\theta_j$, so positions wrap around more slowly and longer contexts can be encoded.

Llama 3's hyperparameters:
![525](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922120004.png)

<mark>**Question 2: Based on Section 3.2.1, explain in your own words how Llama 3 chose the size of its flagship model.**</mark>
#### Choosing model size with scaling laws
As we've seen, training large models is very expensive, so small models are trained first to find the right size and settings for the large one.
The authors point out the main challenges: existing scaling laws only predict **next-token prediction loss** (the NLL below), not actual benchmark performance; and results from small pre-training runs may not extrapolate well to large models.

To address this they take a two-step approach:
1. First, fit the relationship between the compute-optimal model's NLL and training compute (in FLOPs);
2. Then, fit the relationship between NLL and actual benchmark accuracy. To extrapolate reliably, the authors explicitly add higher-FLOPs models and earlier Llama 2 models to the fit to make it more accurate.

**Experiment:**
1. Relating the optimal model, FLOPs and training tokens

First, a series of small models is trained with budgets from $6 × 10^{18}$ FLOPs to $10^{22}$ FLOPs and sizes from 40M to 16B parameters.
![Pasted image 20250922122157](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922122157.png)

Figure 2 gives the relationship between loss (measured on a separate validation set to avoid overfitting), training budget and total training tokens. For each budget the authors fit a quadratic to the loss-vs-tokens curve and take its minimum as that budget's compute-optimal model, i.e. the lowest-loss model for the budget. They then fit the FLOPs budget $C$ of these compute-optimal models against training tokens $N^{*}$ with a power law:
$$
N^{*}(C) = AC^{\alpha}
$$
The result is Figure 3: training a 402B-parameter model with $3.8 × 10^{25}$ FLOPs needs 16.55T tokens (close to the 15.6T finally used). The authors also observe that as the budget grows, the loss-vs-tokens curve flattens, so the token count has little effect on performance; they finally settle on 405B.

2. Relating FLOPs to downstream benchmarks

The authors take the compute-optimal models from (1) with larger training FLOPs, fit normalized NLL linearly against training FLOPs, and then fit NLL against benchmark accuracy with a sigmoidal relation (accuracy lives in [0, 1] after all), including Llama 2 models. Plugging the 405B model's FLOPs into the first fit gives NLL, and plugging NLL into the second gives predicted accuracy — which turned out to be quite accurate.
![Pasted image 20250922123648](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922123648.png)
**<mark>End of Question 2</mark>**
### Infrastructure, Scaling, and Efficiency
#### Infrastructure
This part covers the hardware and networking used for training. Meta really does have deep pockets.
#### Parallelism
Llama 3 uses 4D parallelism, combining tensor parallelism, pipeline parallelism, context parallelism and fully sharded data parallelism (which shards the model, optimizer, and gradients).
![Pasted image 20250922140126](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922140126.png)

<mark>**Question 3: Briefly summarize the main features of the four kinds of parallelism in Section 3.3.2.**</mark>
To answer this I dug into parallelism, which I didn't know much about before. I wanted to be thorough, so this part runs long :)
##### Fully sharded data parallelism:
*References:*
*https://zhuanlan.zhihu.com/p/650002268;*
*https://github.com/chunhuizhang/pytorch_distribute_tutorials;*
*"PyTorch FSDP: Experiences on Scaling Fully Sharded Data Parallel";*
Before explaining FSDP, it helps to define some communication primitives:
**(1) Broadcast**
Send data from the main node to the other nodes in the cluster. Below, device 1 broadcasts a 1×N tensor to the other devices, and every card ends up with the 1×N tensor:
<img src="https://s3.51cto.com/oss/202409/13/e9112de90d3784679ce5517ca47c376b650053.webp" alt="" referrerpolicy="no-referrer" />
**(2) Scatter**
The main node splits a large block of data into pieces and sends each piece to a different node. Below, device 1 splits a 1×N tensor into 4 sub-tensors and sends one to each device:
<img src="https://s9.51cto.com/oss/202409/13/d94d5ba34ae7315dcbd6085ccffa430dc09350.webp" alt="" referrerpolicy="no-referrer" />
**(3) Reduce**
Aggregate results from different nodes. There are several kinds — SUM, MIN, MAX, PROD, LOR (logical or), etc. — each a different aggregation. Below, Reduce Sum adds up the data on all devices and returns the result to device 1:
<img src="https://s8.51cto.com/oss/202409/13/a92850d367e6bf60fcf8177937c40075d40b09.webp" alt="" referrerpolicy="no-referrer" />
**(4) All Reduce**
Perform the same reduce (sum, min, max, ...) on all nodes. It can be done as a Reduce on one node followed by a Broadcast.
Below, All Reduce Sum adds up the data on all nodes and broadcasts the sum to every node:
<img src="https://s6.51cto.com/oss/202409/13/f6fce0e382cd79e63bf868f99da3cc4f0624d7.webp" alt="" referrerpolicy="no-referrer" />
**(5) Gather**
Collect the data from all nodes onto a single node — the inverse of Scatter.
Below, Gather collects the data from all devices onto device 1:

<img src="https://s9.51cto.com/oss/202409/13/9946ae986c93890ab7e49580a03224ae14d927.webp" alt="" referrerpolicy="no-referrer" />
**(6) All Gather**
Every node collects the data of all other nodes, so each ends up with the complete set. It's Gather combined with Broadcast. Below, All Gather collects the data from all devices onto every device.
<img src="https://s2.51cto.com/oss/202409/13/e6fb91d14badad23a846997505fc310377ef30.webp" alt="" referrerpolicy="no-referrer" />
**(7) Reduce Scatter**
Split each node's tensor into blocks, send each block to a different node, then reduce (sum, average, ...) on each node. Below, Reduce Scatter splits each device's tensor into 4 blocks, sends them to the 4 devices, and each device Reduce-Sums the blocks it receives.
<img src="https://s8.51cto.com/oss/202409/13/b15e2391448b28b3b2f474da35bddb87dcf3b8.webp" alt="" referrerpolicy="no-referrer" />
**(8) All to All**
Split each node's data into blocks and send the blocks to different nodes.
Below, All to All splits each device's tensor into 4 blocks and sends them to the 4 different devices.
<img src="https://s2.51cto.com/oss/202409/13/d2ef159354cd90cb90e900548674fba25a706e.webp" alt="" referrerpolicy="no-referrer" />

FSDP evolved from DP and DDP. Data parallelism was invented because **the training data is too large**: memory runs out and the batch size can't be increased. The simplest DP splits a big batch into small batches for different GPUs, replicates the model parameters on every GPU, and runs the forward pass for each small batch on its GPU.

Next, with DP, each GPU's output is sent to a main GPU that computes the loss gradient, which is sent back to all GPUs for backprop; the gradients are then gathered on the main GPU, which updates the parameters and broadcasts them. With DDP (Distributed Data Parallelism), each GPU runs forward and backward to compute its gradients, an All-Reduce averages the gradients across all GPUs, and each GPU updates its own parameters with the averaged gradient (all copies stay identical). DDP is clearly more efficient than DP, with no single-card bottleneck.

Then comes FSDP. DDP allows larger batches, but besides data, the model parameters, optimizer states and gradients also take up much of GPU memory, and DDP needs a full model copy on every GPU. FSDP borrows ZeRO's sharding idea and shards the optimizer states, gradients and model weights:
![DeepSpeed Architecture|600](https://www.microsoft.com/en-us/research/uploads/prod/2020/02/DeepSpeed-Image-1.png)

The core of FSDP is splitting DDP's All-Reduce into separate Reduce-Scatter and All-Gather operations. This lets the model parameters be spread across GPUs too: gather them for a computation, then free them, saving a lot of GPU memory.
![600](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922211715.png)

Here's the FSDP flow I took from the PyTorch FSDP paper. Simply put, the model is first divided into FSDP units (here each unit has two layers):
![600](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922211350.png)

FSDP is applied to each unit, spreading its parameters across GPUs — that's sharding. When a GPU runs the forward pass on its data shard, it first gathers the parameters from the other GPUs, then frees them after computing to leave memory for other work.
![600](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922211408.png)

The backward pass likewise gathers first and computes gradients for each data shard, then does a Reduce-Scatter: each GPU collects and sums the gradients for its own slice of the parameters from the other GPUs. Unneeded gradients and parameters are freed, and each GPU updates its weights using its own gradients and its shard of the optimizer state. That's how optimizer states, gradients and weights are stored sharded while computing in parallel.
![600](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922211655.png)

Putting it all together:
![600](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922201129.png)

In the paper, the full FSDP flow across units also overlaps All-Gather with the forward pass and interleaves the forward passes of different units according to their layer order (Unit 0, 1). I won't go into that here.
![600](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922211512.png)

**In short, FSDP builds on data parallelism by sharding optimizer states, gradients and weights, gathering them when needed and freeing them right after computing, which saves a great deal of GPU memory.**

**How FSDP differs in Llama 3:**
Llama 3's FSDP also shards optimizer states, gradients and weights, but it doesn't free the parameters right after the forward computation as described above. It frees them after the backward pass instead, trading memory for one fewer all-gather.
##### Tensor Parallelism:
*References:*
*https://zhuanlan.zhihu.com/p/657921100;*
Tensor parallelism also saves memory: large model tensors are split across GPUs, computed in parallel, then concatenated. The principle is simple — a big matrix multiplication can be split into smaller multiplications whose results are concatenated, as in row and column parallelism:
![Pasted image 20250923182526](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923182526.png)

MLPs split easily, and attention can be split too, much like multi-head attention: the Q, K and V weight matrices are split by columns with one head per GPU computed in parallel, and the output linear layer is split by rows.
![Pasted image 20250923182750](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923182750.png)

Beyond 1D splitting of the weights, the input can also be split for 2D tensor parallelism, and split further for 3D. The principle is similar to 1D, and the paper doesn't describe many changes to tensor parallelism.
![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250926161811.png)
##### Pipeline Parallelism:
*References:*
*https://zhuanlan.zhihu.com/p/653860567;*
*"Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM";*
Pipeline parallelism assigns different layers of the model to different GPUs and trains them in layer order. In the simplest form below, 4 GPUs run forward and backward on their own stage in sequence, passing each layer's results along.
![Pasted image 20250923184206](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923184206.png)

The problem is that only one GPU is busy at any moment. The idle "bubble" fraction is $O(\frac{K-1}K)$, and it grows with the number of GPUs $K$.

The first fix borrows from data parallelism: split each mini-batch into $M$ micro-batches, run all the forward passes, then all the backward passes. Since there are more batches to run in parallel, the bubble fraction shrinks to $O(\frac{K-1}{K+M-1})$:
![Pasted image 20250923195124](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923195124.png)

That scheme is "F then B": after the forward passes, lots of micro-batch activations are cached. To use memory better, we can use 1F1B, interleaving each micro-batch's forward and backward passes so a batch that finishes backward early frees its memory for later work.
![Pasted image 20250923185332](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923185332.png)

Going further, interleaved 1F1B reduces the bubble even more, which is close to what Llama 3 uses.
![Pasted image 20250923185436](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923185436.png)
(Dark = virtual stages 1-8, light = virtual stages 9-16)
The idea is to build a virtual pipeline with the same number of devices, trading extra communication for a smaller bubble. The 4 stages are split into smaller virtual stages: where each device used to own one stage, each stage now becomes 4 virtual stages, 16 in total. Each device owns 2 virtual stages per round (called one model chunk), and the forward pass goes around twice: once through 1-8, and right after that, from the start again for virtual stages 9-16, while the backward pass for 1-8 begins. This greatly improves GPU utilization.

The catch is that the number of micro-batches in a mini-batch must be a multiple of the number of pipeline devices, otherwise the work can't overlap.

**Llama 3's pipeline-parallelism optimizations:**
![Pasted image 20250923185921](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923185921.png)
The paper names three pipeline challenges:
1. **Interleaved 1F1B needs the number of micro-batches to be a multiple of the pipeline degree, but pre-training may need flexible batch sizes:**
	As the figure shows, Llama 3 modifies interleaved 1F1B by delaying some forward passes slightly, so with 4 pipeline stages, 5 micro-batches still work.
2. **The first stage uses more memory because of the embedding and the warm-up:**
3. **The output and loss have to be computed after the last layer, creating a latency bottleneck:**
	Llama 3 puts only the embedding layer in the first chunk of stage 1, and only the output projection and loss computation (no Transformer layers) in the last chunk of the last stage, balancing load and per-stage latency.

They also use asynchronous point-to-point communication and drop input and output tensors each stage doesn't need, among other optimizations.
##### Context Parallelism:
*References:*
*https://zhuanlan.zhihu.com/p/683714620;*
*https://github.com/chunhuizhang/pytorch_distribute_tutorials;*
*"DeepSpeed Ulysses: System Optimizations for Enabling Training of Extreme Long Sequence Transformer Models";*
Models now need long contexts, and attention's memory grows as $O(n^{2})$ in sequence length. So the input context is split across GPUs, each computing attention for only part of the context, to save memory.

A common implementation is ring attention: the split KV pairs rotate between GPUs, attention is computed in turns, and the partial results are corrected and aggregated into the final output:
![Pasted image 20250923210749](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923210749.png)

But I think Llama 3's context parallelism is closer to Ulysses: after splitting QKV and the input context, an all-gather assembles the full KV before computing attention, attention runs on the still-split Q, and the results are merged at the end. Because Q is split, each card needs much less memory.
![Pasted image 20250923210920](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923210920.png)
**Llama 3's context-parallelism optimizations:**
1. The input sequence is split into twice as many chunks as the context-parallel degree, and each card gets two slices symmetric about the center. This balances the Q computation load under the causal mask, as below:

![Pasted image 20250923210722](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250923210722.png)
2. Similar to Ulysses, the authors justify all-gather by noting it supports more kinds of attention masks, and that since GQA makes KV small, the latency is acceptable.

With context parallelism, Llama 3 extends its context from 8K to 128K tokens.
##### Llama 3's 4D parallelism:
![Pasted image 20250922140814](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250922140814.png)
After all that, training is finally parallelized. The authors order the kinds of parallelism by their communication needs: the innermost has the lowest latency requirements and the outer ones higher. Llama 3's order from inner to outer is [TP, CP, PP, DP].
**<mark>End of Question 3</mark>**
#### Collective Communication
#### Reliability and Operational Challenges
A showcase of training runs going wrong.
### Training Recipe
**<mark>Question 4: According to Section 3.4, how many phases does Llama 3's pre-training have? What advantage does this have over a single phase?</mark>**
Llama 3's pre-training has three phases: initial pre-training, long-context pre-training and annealing.
#### Initial pre-training
Pre-training uses the AdamW optimizer with a peak learning rate of $8×10^{-5}$, a linear warmup of 8,000 steps, and cosine decay to $8×10^{−7}$ over 1,200,000 steps.
The authors use small batches early in training for stability (with warmup, even small batches don't oscillate much, and small batches help converge faster), then gradually double the batch size and input length later for efficiency. The resulting loss curve is fairly smooth.
The pre-training data in this phase went through the preprocessing above, with more non-English data and a higher share of math reasoning; see the earlier sections.
#### Long-context pre-training
Only at the end of pre-training do they train on 128K tokens, because using such long contexts from the start would need far more compute and take much longer to converge. They increase the sequence length gradually, waiting until the model adapts before increasing it again ("adapted" means (a) the model's short-context performance has fully recovered and (b) it perfectly solves needle-in-a-haystack at that length, as in the results above).
#### Annealing
*Reference: https://zhuanlan.zhihu.com/p/693076242*
For the last 40M training tokens, they linearly decay the learning rate to 0 while keeping the context at 128K tokens. From what I've read, near the end of training the loss shouldn't be dropping fast anymore; lowering the learning rate then helps the model settle into a sharp minimum and reach a lower loss. Llama also switches to high-quality data in this phase, whose gradients are likely more accurate than those of low-quality data, which helps find a good minimum. Finally, Polyak averaging of several model checkpoints from annealing produces the final model.

**What do multiple phases buy you?**
1. Initial pre-training uses smaller batches and shorter sequences, so it converges faster with shorter iterations;
2. Long-context pre-training then gradually adds long sequences to further improve long-context performance;
3. Annealing at the end makes the loss shrink and converge quickly.

Compared to a single phase, this takes less time, is more efficient, and keeps the loss curve smooth.
**<mark>End of Question 4</mark>**
## Post-Training
Each round of Llama 3's post-training is an SFT step followed by a DPO step, with training data from human annotation and model generation.
### Modeling
Llama 3's post-training is iterative, 6 rounds in total. The core of each round: reward modeling, rejection sampling, SFT, DPO. At each RM, SFT or DPO stage, models obtained from experiments with different data mixes or hyperparameters are weight-averaged.
#### Chat Dialog Format
**<mark>Question 5: Why does a post-trained LLM need a [chat template](https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_1/#prompt-template)?</mark>**
The chat template link first lists special tokens marking the start of a prompt, the speaker's role, and tool calls. These tokens let the model tell whether the human or the AI is speaking, and what a tool call actually returned. Post-training finetunes on prompts from human-AI interactions like dialogue and tool calls, so the LLM can understand user instructions and respond sensibly.
After that come prompt-response templates for alignment dialogues and tool calls. These prompts and responses are the inputs that teach the model to follow and answer instructions.
**<mark>End of Question 5</mark>**

<mark>**Question 6: Based on Sections 4.1 and 4.2, what role does the reward model play in post-training?**</mark>
#### Reward Modeling
The reward model fits human preferences in order to give the LLM feedback. It scores each LLM response, and the score reflects how well the response matches human preferences. An RM is usually an LLM with an extra head that outputs a score.
In Llama 3, the RM is trained on top of the pre-trained model. Besides the standard (chosen, rejected) preference pairs, some prompts get a third "edited response" — a human-edited version of the chosen response. Each sample has two or three responses ranked edited > chosen > rejected. During training, the prompt and the shuffled responses are concatenated into one input, which is equivalent to scoring each response separately but more efficient. The loss maximizes the differences between the scalar scores of the edited, chosen and rejected examples, and training proceeds by backprop.
#### Supervised Finetuning
In SFT, the training inputs are instructions of various kinds, and the target outputs are the responses we want the model to give. SFT asks the model to understand and answer instructions rather than just predict the next token, so the model's sequence is input + output, but the input part is masked out of the loss. Answering the instruction itself is still done as next-token prediction.
#### Direct Preference Optimization
*Reference: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model"*
Usually RLHF follows SFT. Think of it as a teacher: the LLM student has learned basic knowledge in pre-training and problem-solving methods in SFT; now it solves problems and improves itself based on RLHF's scores, reinforcing correct solutions to raise its score. If SFT is "giving someone a fish", preference optimization is "teaching them to fish".
DPO uses a mathematical derivation to reduce the original RL process to optimizing a simple loss. You keep one frozen copy of the SFT model as reference and iterate on another, updating its parameters directly by backprop through this loss, achieving the effect of RLHF:
$$
 L_{\text{DPO}}(\pi_\theta; \pi_{\text{ref}}) = -\mathbb{E}(x, y_w, y_l) \sim D \left[ \log \sigma \left( \beta \log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)} \right) \right]
$$
Its gradient is:
$$
 \begin{align*}
\nabla_\theta \mathcal{L}_{\text{DPO}}(\pi_\theta; \pi_{\text{ref}}) &= \\
&- \beta \mathbb{E}_{(x, y_w, y_l) \sim D} \left[ 
\underbrace{\sigma\big( \hat{r}_\theta(x, y_l) - \hat{r}_\theta(x, y_w) \big)}_{\text{higher weight when reward estimate is wrong}} 
\left[ 
\underbrace{\nabla_\theta \log \pi(y_w | x)}_{\text{increase likelihood of } y_w} 
- 

\underbrace{\nabla_\theta \log \pi(y_l | x)}_{\text{decrease likelihood of } y_l} 
\right] 
\right],
\end{align*}
$$
So the update pushes the model toward the preferred output $y_{w}$.
In Llama 3, the preference data for each DPO round is mostly generated by the strongest model of the previous iteration, so its distribution is close to the policy being trained, which helps training.
There are also some refinements:
1. The special formatting tokens introduced earlier are masked out, so tokens that appear in both the chosen and rejected responses don't cause problems during training;
2. A supervised NLL loss term is added on top of the original DPO loss:
	![425](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925000101.png)
	This NLL loss applies only to the chosen response. It further stabilizes DPO training by keeping the desired generation format and preventing the log-probability of the chosen response from dropping.

### Post-training data
This part of the paper is a bit disorganized, so I'm not following its order:
![Pasted image 20250924202152](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250924202152.png)
#### Where does the data come from?
1. Preference data (labels human preferences):
	1. Prompts:
		Prompts written or collected by humans;
		prompt complexity rises as the model improves.
	2. Generating responses:
		Models are trained with different data mixes and alignment methods; for each prompt, two different models are sampled to produce two responses.
	3. Producing the data:
		Humans label the responses as edited / chosen / rejected and rate how much better chosen is than rejected; only clearly better samples are used for training.
	For training the RM: all preference data.
	For training DPO: the latest round's preference data.
2. SFT data (provides reference solutions):
	1. Prompts:
		Prompts written or collected by humans;
		late in the post-training iterations, special system prompts are introduced to strengthen format, style, etc. on specific tasks;
		for long context, the pre-trained Llama 3 generates QA pairs.
	2. Generating responses:
		The best model after the previous DPO round generates K responses per prompt;
		expert models trained for specific capabilities generate synthetic data from specially designed prompts (specialized per-capability data).
	3. Producing the data:
		The RM trained on preference data does rejection sampling over the post-DPO responses, and the best response becomes SFT data;
		synthetic data after rejection sampling;
		a small amount of human-annotated data.

#### How is the data processed?
Deduplicate unwanted response patterns; topic classification, quality scoring, difficulty scoring, and RoBERTa-based semantic deduplication.
#### What is the reward model for? — Rejection sampling
To sum up: the reward model fits human preferences. In post-training, preference data trains the reward model, and the reward model does rejection sampling over SFT data generated by the previous round's model and the domain-expert models. This filters out SFT data that better matches our preferences for the model to learn from, aligning it more closely with human preferences.
**<mark>End of Question 6</mark>**
## Inference
This section is about optimizing inference efficiency.
### Pipeline parallelism
The original BF16 405B model doesn't fit on one inference machine, so it's split across two. Tensor parallelism is bottlenecked by interconnect bandwidth and latency, so pipeline parallelism is used.
Unlike training, there's no backward pass, so the bubble isn't much of an issue; inference just runs in micro-batches.
![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925224402.png)
### FP8 quantization
Model parameters are quantized to FP8 to save memory, mainly the MLP parameters; self-attention is left alone. The first and last Transformer layers are kept unquantized, and a finer-grained row-wise quantization (a scaling factor per row) is used.
![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925225718.png)

## Multimodal extensions
### Vision
#### Data
The image encoder and adapter are trained on image-text pairs. Data collection has four main stages: (1) quality filtering; (2) perceptual deduplication (the SSCD model computes a 512-dimensional representation, and these embeddings are used for nearest-neighbor search over every image in the dataset with cosine similarity); (3) resampling (based on n-grams); (4) optical character recognition (text in the image is extracted via OCR and appended to the caption, which improves the model's OCR ability).
During annealing, images with bounding boxes, screenshots, model-generated images and so on are added. Video-text pairs are also used.
#### Model architecture
![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250925230124.png)
**Image encoder:** a standard ViT. Since ViTs struggle with fine detail, outputs from several intermediate ViT layers are added to the final layer's output. In addition, 8 gated self-attention layers are inserted before cross-attention pre-training (40 Transformer blocks in total) to learn alignment-specific features.
![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250926120606.png)
**Image adapter:**
Cross-attention layers are introduced between the visual token representations from the image encoder and the language token representations from the language model, fusing image and language. A cross-attention layer is applied after every 4 self-attention layers in the core language model, and like the language model itself, they use grouped-query attention (GQA) for efficiency.

The cross-attention image adapter is pre-trained in two stages:
1. Pre-training
	The image adapter is pre-trained on a dataset of about 6B image-text pairs;
2. Annealing
	Training continues on about 500M images from the annealing dataset described above, at a higher image resolution, to improve performance on tasks that need high-resolution images.

**Video adapter:**
The model takes up to 64 frames, each processed by the image encoder. A video aggregator and cross-attention layers model the temporal structure: frames first go through the aggregator, then into the cross-attention layers.

1. Temporal aggregator:
	32 consecutive encoded frames are aggregated into one by the temporal aggregator, a perceiver resampler. During pre-training it uses 16 frames per video (aggregated into 1), but during supervised finetuning the input is increased to 64 frames.
2. Cross-attention:
	An extra video cross-attention layer is added before every 4th image cross-attention layer.

With the visual recognition components added, the model now consists of self-attention layers, cross-attention layers (image and video), and a ViT image encoder.
#### Model parallelism
Mainly pipeline parallelism. The imbalance between cross-attention and self-attention compute is solved by making each pipeline stage contain five layers: four self-attention layers from the language backbone and one cross-attention layer (recall that a cross-attention layer follows every four self-attention layers).
#### Finetuning
##### Image SFT
The language model's weights stay frozen to preserve text-only performance; only the vision encoder and image adapter are updated.
The authors run a hyperparameter search over random subsets of SFT data, learning rates and weight-decay values, rank the resulting models by performance, and average the weights of the top-K models to get the final model. K is chosen by evaluating the averaged models and picking the best-performing one.
##### Video SFT
Similar to image SFT. In this stage the video length is increased to 64 frames with an aggregation factor of 32, giving two effective frames. The chunk resolution is also increased to match the corresponding image hyperparameters.
##### DPO
Instead of keeping the reference model frozen throughout, updating it as an exponential moving average (EMA) every k steps helps the model learn more from the data and leads to better human-evaluation results.

### Speech
![](/images/blog/llama3-tech-report/attachments/Pasted%20image%2020250926124235.png)
#### Model design
The model has two main functions: speech understanding and speech generation. The speech module's output goes straight into the language model as token representations, allowing direct interaction between speech and text tokens. This is quite different from the vision module, which feeds multimodal information into the language model through cross-attention layers. The speech module's embeddings, by contrast, blend seamlessly with text tokens, so the speech interface can use all of the Llama 3 language model's capabilities.
On the input side, an encoder and an adapter process the speech signal. A system prompt (in text) switches Llama 3 between different modes of speech understanding. Without a system prompt, the model acts as a general spoken-dialogue model that responds to the user's speech consistently with the text version of Llama 3.
Dialogue history is added as a prompt prefix to improve multi-turn conversations. The authors also experiment with system prompts that enable Llama 3 for automatic speech recognition (ASR) and automatic speech translation (AST).
They also try a speech generation approach: a streaming text-to-speech (TTS) system that generates speech waveforms on the fly during language-model decoding. Llama 3's speech generator is built on a proprietary TTS system, and the language model is not finetuned for speech generation. Instead, they focus on improving the latency, accuracy and naturalness of speech synthesis by using Llama 3 embeddings at inference time.
##### Speech understanding
**Speech encoder:**
A 1B-parameter Conformer model. Its input is 80-dimensional mel-spectrogram features, first processed by a stride-4 stacking layer and then a linear projection that reduces the frame length to 40 ms.
The processed features go through an encoder of 24 Conformer layers. Each Conformer layer has a latent dimension of 1536 and consists of two Macron-net-style feed-forward networks of dimension 4096, a convolution module with kernel size 7, and a rotary attention module with 24 attention heads.
**Speech adapter:**
The speech adapter has about 100M parameters: a convolution layer, a rotary Transformer layer and a linear layer. The convolution layer has kernel size 3 and stride 2 to reduce the speech frame length to 80 ms, giving the language model coarser-grained features. The Transformer layer has a latent dimension of 3072 and a 4096-dimensional feed-forward network, and further processes the speech information with context after the convolutional downsampling. Finally, **the linear layer maps the output dimension to match the language model's embedding layer.**
##### Speech generation
In Llama 3's speech generation system, Llama 3 8B embeddings are used in two core components: text normalization (TN) and prosody modeling (PM).
The TN module uses an LSTM model and Llama 3 embeddings, with cross-attention, to do context-aware streaming conversion from written to spoken form, keeping the meaning accurate.
The PM module is a unidirectional Transformer that uses two cross-attention mechanisms to fuse linguistic features from TN with Llama 3 embeddings. It predicts prosodic features such as phone duration, fundamental frequency and energy at the token level. Without needing explicit alignment, this markedly improves the naturalness and expressiveness of the synthesized speech and lowers latency, giving accurate and fluent end-to-end speech synthesis.
#### Training
##### Speech understanding
Llama 3's speech understanding is built in two compositional stages. First, the speech encoder is self-supervised pre-trained with the BEST-RQ algorithm on 15 million hours of multilingual speech, giving it strong generalization across languages and acoustic conditions.
Then, in supervised finetuning, the encoder and a dedicated adapter are trained jointly with the frozen Llama 3 LLM on ASR, AST and spoken-dialogue data, unlocking specific speech-understanding abilities. To balance language-specific performance with generality, Llama 3 specifies the target language only for the output text in the system prompt (e.g. "Repeat after me in English:" or "Translate into French:"), without requiring a language ID on the input speech. This steers the model toward responses in the desired language while keeping its zero-shot transfer to unseen language directions and its ability to handle code-switched speech, resulting in strong and flexible multilingual speech interaction.
##### Speech generation
Llama 3's speech generation uses a Transformer-based prosody model (PM) to improve the naturalness and expressiveness of synthesized speech, taking embeddings from a frozen Llama 3 8B model as a key input. For low-latency real-time processing, it uses a lookahead mechanism: a fixed number of future phones and a variable number of future tokens, matching the chunking used in text normalization.
In training, the model uses a batch size of 1,024 utterances for 1 million updates, with an initial learning rate of 9e-4, the AdamW optimizer, a cosine learning-rate schedule, and a 3,000-update warmup.
At inference, the system follows the same lookahead and causal-masking strategy as in training and processes input text in a streaming fashion, keeping training and deployment consistent. To better model long-range prosodic dependencies, it also uses a delayed pattern approach, which markedly improves the naturalness and expressiveness of the synthesized speech while keeping latency low.
