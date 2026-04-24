import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

interface CreditFeatures {
  user_id: string;
  age: number;
  monthly_income: number;
  loan_amount: number;
  loan_term_months: number;
  credit_history_years: number;
  current_debt: number;
  employment_years: number;
  dependents: number;
}

interface PredictionResponse {
  probability: number;
  result: string;
  score: number;
  riskLevel: string;
  recommendedAmount: number;
}

export async function getPrediction(
  features: CreditFeatures,
): Promise<PredictionResponse> {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, features);
    return response.data;
  } catch (error) {
    console.error("ML Service error:", error);
    // Fallback response if ML service is down
    return {
      probability: 0.5,
      result: "error",
      score: 50,
      riskLevel: "unknown",
      recommendedAmount: features.loan_amount * 0.5,
    };
  }
}

export async function checkMLHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`);
    return response.data.status === "ok";
  } catch {
    return false;
  }
}
