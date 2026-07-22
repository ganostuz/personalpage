---
title: Evaluation that helps you decide
description: Why the most useful evaluation is the one that changes the next engineering decision.
topic: LLM evaluation
demo: true
---

An evaluation can be technically correct and still be useless. A dashboard may show that a system scored `0.82`, but the number alone does not tell a developer whether to ship, investigate, collect new examples, or leave the system alone.

The useful question is not only *how well did the model perform?* It is *what decision should this evidence help us make?*

## Start with the decision

Before choosing a metric, I find it useful to finish one sentence:

> If this evaluation changes, we will decide whether to ______.

The blank might contain “release the new prompt,” “keep the current model,” or “ask for human review.” If nothing concrete fits, the evaluation probably lacks a clear owner or purpose.

Different decisions need different evidence:

| Decision | Useful evidence | Weak substitute |
| --- | --- | --- |
| Release a prompt change | Regressions on important scenarios | One aggregate score |
| Change a model | Quality, latency, and cost together | Quality in isolation |
| Add human review | Examples of high-impact uncertainty | Average confidence |

The point is not to avoid aggregate metrics. It is to keep them connected to examples and consequences.

## Define expectations in observable language

“High quality” is difficult to test. “Names the next action and does not invent a deadline” is much easier. Observable expectations produce better review criteria and better conversations when results are disputed.

```yaml
scenario: subscription_cancelled
input: "I cancelled yesterday. Will I be charged again?"
expectations:
  - explains the billing status
  - gives a clear next action
  - does not invent account details
priority: high
```

This structure is intentionally modest. It can support human review first and automation later. More importantly, it documents why the scenario matters.

## Treat disagreement as information

When two reviewers disagree, it is tempting to hide the disagreement inside an average. That can erase the most valuable part of the result.

Disagreement may reveal that:

- the expectation is too vague;
- the scenario needs more context;
- two valid product behaviours are competing;
- the evaluation is asking a metric to settle a design decision.

<aside class="article-callout">
  <p><strong>Review principle:</strong> A disputed example is often more useful than an undisputed score because it exposes an assumption the team has not yet made explicit.</p>
</aside>

## Report changes, not just totals

A compact comparison is often enough to guide the next step. Instead of showing only a new total, group the scenarios by what changed:

```text
improved:   7 scenarios
unchanged: 31 scenarios
regressed:  3 scenarios
new:        4 scenarios
```

The three regressions deserve attention before the seven improvements deserve celebration. Their priority depends on the users affected and the severity of the failure—not merely their count.

## Close the loop

An evaluation system becomes valuable when its results regularly lead to one of a few visible actions: ship, revise, investigate, or collect evidence. If results accumulate without changing work, the system is producing measurement rather than feedback.

The best evaluation is therefore not necessarily the most sophisticated. It is the smallest trustworthy process that helps a team make the next decision with less guesswork.
