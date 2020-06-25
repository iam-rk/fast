import AnimateTo from "../animateTo";
import AnimateFrom from "../animateFrom";
import { invokeFunctionForEach } from "../utilities/invokeFunctionForEach";

/**
 * Groups {@link @microsoft/fast-animation#AnimateTo} and {@link @microsoft/fast-animation#AnimateFrom} instances, providing a single API to operate on all of them.
 * @public
 */
class AnimateGroup {
    /**
     * Stores the onFinish callback
     */
    private _onFinish: () => void;

    /**
     * Stores the group effect object
     */
    private animations: Array<AnimateTo | AnimateFrom>;

    constructor(animations: Array<AnimateTo | AnimateFrom>) {
        this.animations = animations;
    }

    /**
     * Expose onFinish callback
     */
    public set onFinish(callback: () => void) {
        this._onFinish = callback;
        const longestRunning: AnimateTo | AnimateFrom = this.getLongestAnimation();

        if (typeof longestRunning.onFinish === "function") {
            const fn: () => void = longestRunning.onFinish;
            longestRunning.onFinish = (): void => {
                fn();
                this._onFinish();
            };
        } else {
            longestRunning.onFinish = this._onFinish;
        }
    }

    /**
     * Play the group of animations
     */
    public play(): void {
        invokeFunctionForEach(this.animations, "play");
    }

    /**
     * Reverses all animations in the group
     */

    public reverse(): void {
        invokeFunctionForEach(this.animations, "reverse");
    }

    /**
     * Pauses all animations in the group
     */
    public pause = (): void => {
        invokeFunctionForEach(this.animations, "pause");
    };

    /**
     * Finishes all animations in the group
     */
    public finish = (): void => {
        invokeFunctionForEach(this.animations, "finish");
    };

    /**
     * Cancels all animations in the group
     */
    public cancel = (): void => {
        invokeFunctionForEach(this.animations, "cancel");
    };

    /**
     * Returns the longest running animation in the group
     */
    private getLongestAnimation(): AnimateTo | AnimateFrom {
        return this.animations.reduce(
            (
                previousValue: AnimateTo | AnimateFrom,
                currentValue: AnimateTo | AnimateFrom
            ) => {
                const previousDuration: number = this.getAnimationDuration(
                    previousValue.effectTiming
                );
                const currentDuration: number = this.getAnimationDuration(
                    currentValue.effectTiming
                );

                // If two durations in the group are equal, consider the higher index the
                // longest animation - this helps ensure the group onFinish callback
                // is fired after all individual animation onFinish callbacks have fired.
                return currentDuration >= previousDuration ? currentValue : previousValue;
            }
        );
    }

    /**
     * Returns the cumulative time it will take to complete an animation
     */
    private getAnimationDuration(effectTiming: EffectTiming): number {
        const duration: string | number = effectTiming.duration;
        const sanitizedDuration: number =
            typeof duration === "string" ? parseFloat(duration) : duration;

        return (effectTiming.delay || 0) + (sanitizedDuration || 0);
    }
}

export default AnimateGroup;
