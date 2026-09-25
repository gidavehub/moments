/**
 * Poses are data. Each limb has a base angle (degrees from straight-down, positive = outward /
 * up away from the body), an elbow bend, a length, and an oscillation (amp°, phase offset).
 * The rig springs the base values between poses and adds the oscillation on the UI thread.
 */

export interface LimbPose {
  a: number;
  bend: number;
  len: number;
  amp: number;
  off: number;
}

export interface Pose {
  armL: LimbPose;
  armR: LimbPose;
  legL: LimbPose;
  legR: LimbPose;
  /** Oscillation period in ms. */
  period: number;
  /** Body bob loop in ms (0 = none). */
  bob: number;
  bobAmp: number;
}

export type PoseName = 'idle' | 'wave' | 'pointUp' | 'think' | 'celebrate' | 'carry' | 'sleep' | 'run';

const limb = (a: number, bend = 8, len = 34, amp = 0, off = 0): LimbPose => ({ a, bend, len, amp, off });
const leg = (a = 4, amp = 0, off = 0): LimbPose => ({ a, bend: 3, len: 26, amp, off });

export const poses: Record<PoseName, Pose> = {
  idle: { armL: limb(26, 10, 32, 4, 0), armR: limb(26, 10, 32, 4, 0.5), legL: leg(), legR: leg(), period: 2600, bob: 2600, bobAmp: 3 },
  wave: { armL: limb(22, 10, 32, 2), armR: limb(146, -18, 42, 18, 0), legL: leg(), legR: leg(), period: 700, bob: 1400, bobAmp: 3 },
  pointUp: { armL: limb(8, -26, 28, 2), armR: limb(148, -16, 56, 3), legL: leg(8), legR: leg(-2), period: 1800, bob: 1800, bobAmp: 2 },
  think: { armL: limb(24, 8, 30, 2), armR: limb(-52, 22, 44, 3), legL: leg(), legR: leg(), period: 2400, bob: 3000, bobAmp: 2 },
  celebrate: { armL: limb(152, -16, 44, 14, 0), armR: limb(152, -16, 44, 14, 0.5), legL: leg(10, 6, 0), legR: leg(10, 6, 0.5), period: 520, bob: 520, bobAmp: 7 },
  carry: { armL: limb(-34, 14, 34, 2), armR: limb(-34, 14, 34, 2, 0.5), legL: leg(), legR: leg(), period: 1200, bob: 1200, bobAmp: 3 },
  sleep: { armL: limb(10, 4, 30, 1), armR: limb(10, 4, 30, 1, 0.5), legL: leg(2), legR: leg(2), period: 3600, bob: 3600, bobAmp: 2 },
  run: { armL: limb(36, 14, 32, 34, 0), armR: limb(36, 14, 32, 34, 0.5), legL: leg(4, 30, 0.5), legR: leg(4, 30, 0), period: 520, bob: 260, bobAmp: 4 },
};

export type Expression = 'smile' | 'happy' | 'wow' | 'sleepy' | 'wink' | 'focus';

export const poseExpression: Record<PoseName, Expression> = {
  idle: 'smile',
  wave: 'happy',
  pointUp: 'smile',
  think: 'focus',
  celebrate: 'wow',
  carry: 'smile',
  sleep: 'sleepy',
  run: 'focus',
};
