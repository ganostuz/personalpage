---
title: From a quick LLM workflow to a production system
description: What changes when a useful experiment becomes something another person has to rely on.
topic: Workflow design
demo: true
---

The first version of an LLM workflow is often wonderfully direct: a prompt, an input, and an answer that feels surprisingly good. That is exactly the point of a prototype. It compresses the path from question to feedback.

But the moment someone else relies on that workflow, the question changes. It is no longer *can this produce a good answer?* It becomes *when does it fail, how will we notice, and what happens next?*

## Keep the prototype, add the seams

I do not think the answer is to replace a prototype with a giant framework. The useful next step is smaller: make the assumptions visible enough to inspect.

- Write down representative inputs, including the awkward ones.
- Separate the prompt from the rest of the application logic.
- Save a few outputs that show what “good enough” means.
- Record the model and configuration used for every run.

> Reliability begins when an opinion about quality becomes an example another person can review.

The prototype should stay easy to change. The surrounding seams—inputs, configuration, outputs, and review notes—are what make those changes understandable.

## Turn examples into a small evaluation loop

The first evaluation loop does not need a perfect metric. A compact set of scenarios and a clear place to record a judgement is already more useful than repeatedly running a favourite example by hand.

```python
scenario = evaluate(
    input=customer_question,
    expected="explains the next action clearly",
    model_output=response,
)

record(
    scenario,
    reviewer_note="Helpful, but too vague on timing",
)
```

This is deliberately plain. The goal is not to automate every decision; it is to create a repeatable conversation between the system, its users, and the people responsible for improving it.

<aside class="article-callout">
  <p><strong>A useful rule:</strong> If an evaluation result cannot suggest a next action, it is probably measuring the wrong thing—or presenting it in the wrong way.</p>
</aside>

## Make failures easy to inspect

A single score can tell you that something changed, but it rarely explains why. I would rather begin with a small report that keeps the evidence close to the result:

1. Show the input and output that produced the failure.
2. State which expectation was not met.
3. Preserve the previous output for comparison.
4. Give the reviewer somewhere to record context.

This turns “the score dropped” into a concrete question. Perhaps a prompt became too restrictive, a model update changed tone, or a scenario no longer represents the product. Each explanation suggests a different response.

## Production is a learning environment

A production-ready workflow is not one that never changes. It is one that can change without making everyone nervous. Clear scenarios, inspectable outputs, and short feedback loops create that confidence.

That is the part of LLM systems work I find most interesting: building the conditions where people can learn from model behaviour rather than simply hope for it.
