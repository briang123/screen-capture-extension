# Sidebar Animation Options (Framer Motion)

---

## Configuration Option Reference

Below is a reference for the most common Framer Motion animation configuration options. These help you fine-tune how your sidebar (or any element) animates.

| Option              | Type / Range                 | Description & Effect                                                                           |
| ------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| **stiffness**       | Number (e.g. 100–1000)       | Controls the spring's tightness. Higher = snappier, faster movement. Lower = softer, slower.   |
| **damping**         | Number (e.g. 10–50)          | Controls how much the spring bounces. Higher = less bounce, stops sooner. Lower = more bounce. |
| **mass**            | Number (e.g. 0.1–10)         | Affects inertia. Higher mass = slower acceleration and deceleration, feels heavier.            |
| **duration**        | Number (seconds, e.g. 0.2–2) | How long the animation takes. Higher = slower, lower = faster.                                 |
| **ease**            | String or Array              | Easing function for timing (e.g. 'linear', 'easeInOut', or cubic-bezier array for custom).     |
| **velocity**        | Number                       | Initial speed for inertia. Higher = starts moving faster.                                      |
| **power**           | Number                       | For inertia: how much momentum is applied. Higher = travels further.                           |
| **timeConstant**    | Number                       | For inertia: how quickly the motion slows down. Higher = slower stop.                          |
| **bounceStiffness** | Number                       | For inertia: how stiff the bounce is when hitting boundaries. Higher = snappier bounce.        |
| **bounceDamping**   | Number                       | For inertia: how quickly the bounce settles. Higher = less bounce.                             |
| **times**           | Array of numbers (0–1)       | For keyframes: when each keyframe occurs as a fraction of total duration.                      |

**Tip:** Most options are optional and have sensible defaults. Adjust them to match the feel you want!

---

## 1. Spring (Default)

**Description:**

- Mimics real-world spring physics.
- Can be snappy, bouncy, or soft depending on `stiffness` and `damping`.
- Great for natural, lively UI movement.

**Configurable options:**

- `stiffness`: Higher = faster, snappier.
- `damping`: Higher = less bounce, more damped.
- `mass`: Affects inertia.

**Example:**

```js
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
```

---

## 2. Tween

**Description:**

- Simple, linear or eased interpolation between values.
- No bounce or overshoot.
- Good for smooth, predictable, "material" style movement.

**Configurable options:**

- `duration`: How long the animation takes (seconds).
- `ease`: Easing function (`'linear'`, `'easeIn'`, `'easeOut'`, `'easeInOut'`, `'circIn'`, `'anticipate'`, etc.).

**Example:**

```js
transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut' }}
```

---

## 3. Inertia

**Description:**

- Animates with momentum and friction, like a flick gesture.
- Often used for drag-and-release, not typical for sidebars.

**Configurable options:**

- `velocity`: Initial speed.
- `power`, `timeConstant`, `bounceStiffness`, `bounceDamping`.

**Example:**

```js
transition={{ type: 'inertia', velocity: 100, power: 0.8, timeConstant: 200 }}
```

---

## 4. Keyframes

**Description:**

- Animates through a sequence of values.
- Can create complex, multi-step animations.

**Configurable options:**

- `times`: Array of time points for each keyframe.
- `ease`: Easing for each segment.

**Example:**

```js
animate={{ x: [0, 100, 50, 200] }}
transition={{ duration: 1, times: [0, 0.2, 0.5, 1], ease: 'easeInOut' }}
```

---

## 5. Custom Easing

**Description:**

- Use a custom cubic-bezier curve for unique timing.

**Example:**

```js
transition={{ type: 'tween', duration: 0.6, ease: [0.68, -0.55, 0.27, 1.55] }}
```

---

## Summary Table

| Type      | Description                       | Best For                       | Example Transition                                     |
| --------- | --------------------------------- | ------------------------------ | ------------------------------------------------------ |
| spring    | Natural, bouncy, physics-based    | Lively, playful, natural UIs   | `{ type: 'spring', stiffness: 300, damping: 30 }`      |
| tween     | Smooth, linear/eased, predictable | Material, minimal, subtle UIs  | `{ type: 'tween', duration: 0.5, ease: 'easeInOut' }`  |
| inertia   | Momentum, friction, flicks        | Drag-and-release, momentum UIs | `{ type: 'inertia', velocity: 100 }`                   |
| keyframes | Multi-step, complex               | Custom, staged animations      | `{ duration: 1, times: [0,0.5,1], ease: 'easeInOut' }` |
| custom    | Unique timing curves              | Brand-specific, unique feel    | `{ type: 'tween', ease: [0.68,-0.55,0.27,1.55] }`      |

---

**Choose the style that best fits your product's feel, or ask for a custom configuration!**
