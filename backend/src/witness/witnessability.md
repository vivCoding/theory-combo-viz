# Finite Witnessability
 
Let $\Sigma$ be a signature, let $S \subseteq \Sigma^{\mathbb{S}}$ be a set of sorts, and let $T$ be a $\Sigma$-theory.
We say that $T$ is finitely witnessable with respect to $S$ if there exists a computable function, witness, which, for every
quantifier-free $\Sigma$-formula $\phi$, returns a quantifier-free $\Sigma$-formula $\psi=\text{witness}_T(\phi)$ such that

* $\phi$ and $(\exists \vec{w}) \psi$ are $T$-equivalent, where $\vec{w}=\operatorname{vars}(\psi) \backslash \operatorname{vars}(\phi)$ are fresh variables;
* if $\psi \wedge \delta_V$ is $T$-satisfiable, for an arrangement $\delta_V$, where $V$ is a set of variables of sorts in $S$, then there exists a $T$-interpretation
  $\mathcal{A}$ satisfying $\psi \wedge \delta_V$ such that $A_\sigma=\left[\operatorname{vars}_\sigma\left(\psi \wedge \delta_V\right)\right]^{\mathcal{A}}$, for all $\sigma \in S$,
 
where the notation $[U]^{\mathcal{A}}$ indicates the set $\left\{v^{\mathcal{A}} \mid v \in U\right\}$.

Witness Function for Set. A witness function witness set for the theory $T_{\text {set }}$ can be defined as follows. Without loss of generality, let $\Gamma$ be a conjunction of flat $\Sigma_{\text {set }}{ }^{-}$ literals such that $\operatorname{vars}_{\text {elem }}(\Gamma) \neq \emptyset$. We let witness ${ }_{\text {set }}(\Gamma)$ be the result of applying to $\Gamma$ the following transformation:
- Replace each literal of the form $x \not =_{\text {set }} y$ in $\Gamma$ with a literal of the form $e^{\prime} \in(x \backslash y) \cup(y \backslash x)$, where $e^{\prime}$ is a fresh elem-variable.