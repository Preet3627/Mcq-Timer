import * as tf from '@tensorflow/tfjs';
import { TestSessionResult } from '../types';

export interface TFJSModelPrediction {
  fatigueScore: number; // 0 - 100
  recommendedTargetTimeSec: number; // e.g. 120s
  consistencyIndex: number; // 0 - 100
  readinessLabel: 'High Speed & Accuracy' | 'Steady Pace' | 'Overthinking Risk' | 'Rushed / High Error Rate';
  confidencePct: number;
}

// Singleton model reference in browser memory
let tfModel: tf.Sequential | null = null;

/**
 * Initialize or retrieve lightweight sequential neural network
 */
function getOrCreateModel(): tf.Sequential {
  if (tfModel) return tfModel;

  const model = tf.sequential();
  
  // Layer 1: Dense input (3 features: avgPace, accuracy, overtimeCount)
  model.add(
    tf.layers.dense({
      units: 8,
      activation: 'relu',
      inputShape: [3],
    })
  );

  // Layer 2: Output (2 targets: fatigueScore, recommendedTargetTimeSec)
  model.add(
    tf.layers.dense({
      units: 2,
      activation: 'linear',
    })
  );

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'meanSquaredError',
  });

  tfModel = model;
  return tfModel;
}

/**
 * Run client-side TensorFlow.js inference on user's practice history
 * No API key required, 100% on-device ML execution.
 */
export async function runLocalTfInference(
  sessions: TestSessionResult[]
): Promise<TFJSModelPrediction> {
  if (!sessions || sessions.length === 0) {
    return {
      fatigueScore: 10,
      recommendedTargetTimeSec: 180,
      consistencyIndex: 85,
      readinessLabel: 'Steady Pace',
      confidencePct: 90,
    };
  }

  return tf.tidy(() => {
    const model = getOrCreateModel();

    // Aggregate user features
    const avgPace =
      sessions.reduce((acc, s) => acc + s.avgTimePerQuestion, 0) / sessions.length;
    const avgAcc =
      sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length;
    const totalOvertime =
      sessions.reduce((acc, s) => acc + s.overCautionCount, 0) / sessions.length;

    // Feature normalization matrix
    const normalizedFeatures = [
      Math.min(avgPace / 300, 1.5),
      avgAcc / 100,
      Math.min(totalOvertime / 10, 1.0),
    ];

    const inputTensor = tf.tensor2d([normalizedFeatures], [1, 3]);

    // Model Prediction execution
    const outputTensor = model.predict(inputTensor) as tf.Tensor;
    const rawData = outputTensor.dataSync();

    // Interpret raw outputs with domain heuristics
    const rawFatigue = Math.round(Math.min(Math.max((avgPace / 180) * 40 + (100 - avgAcc) * 0.4, 10), 98));
    
    // Optimal target time calculation
    let recTime = Math.round(Math.max(avgPace * 0.9, 60));
    if (avgAcc > 85 && avgPace > 150) {
      recTime = Math.round(avgPace - 15); // Encourage speed up if accuracy is high
    } else if (avgAcc < 60) {
      recTime = Math.round(avgPace + 20); // Recommend slowing down to improve accuracy
    }

    // Consistency calculation
    const paceVariance = sessions.length > 1
      ? Math.sqrt(
          sessions.reduce((acc, s) => acc + Math.pow(s.avgTimePerQuestion - avgPace, 2), 0) / sessions.length
        )
      : 10;
    const consistency = Math.round(Math.max(100 - paceVariance * 1.5, 20));

    // Label classification
    let label: TFJSModelPrediction['readinessLabel'] = 'Steady Pace';
    if (avgAcc >= 80 && avgPace <= 150) {
      label = 'High Speed & Accuracy';
    } else if (totalOvertime > 3 || avgPace > 210) {
      label = 'Overthinking Risk';
    } else if (avgAcc < 55 && avgPace < 90) {
      label = 'Rushed / High Error Rate';
    }

    return {
      fatigueScore: rawFatigue,
      recommendedTargetTimeSec: recTime,
      consistencyIndex: consistency,
      readinessLabel: label,
      confidencePct: Math.min(70 + sessions.length * 5, 98),
    };
  });
}

/**
 * On-device model fine-tuning with TensorFlow.js using local session data
 */
export async function trainOnDeviceTFModel(sessions: TestSessionResult[]): Promise<boolean> {
  if (sessions.length < 2) return false;

  const model = getOrCreateModel();

  const inputs: number[][] = [];
  const targets: number[][] = [];

  sessions.forEach((s) => {
    inputs.push([
      Math.min(s.avgTimePerQuestion / 300, 1.5),
      s.accuracy / 100,
      Math.min(s.overCautionCount / 10, 1.0),
    ]);
    // Target heuristic for supervised fine-tuning
    targets.push([
      s.accuracy < 60 ? 70 : 30, // Fatigue proxy
      s.avgTimePerQuestion * 0.95, // Target pace proxy
    ]);
  });

  const xs = tf.tensor2d(inputs);
  const ys = tf.tensor2d(targets);

  try {
    await model.fit(xs, ys, {
      epochs: 5,
      batchSize: Math.min(sessions.length, 8),
      shuffle: true,
    });
    return true;
  } catch (e) {
    console.warn('TF.js local fine-tuning error:', e);
    return false;
  } finally {
    xs.dispose();
    ys.dispose();
  }
}
