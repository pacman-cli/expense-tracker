# AI Neural Insights

The **AI Neural Insights** feature provides advanced financial intelligence by combining client-side neural networks with server-side Large Language Models (LLMs).

## Features

### 1. Neural Prediction
- **Technology**: TensorFlow.js (Client-side)
- **Functionality**: Trains a simple Multi-layer Perceptron (MLP) directly in your browser using your last 6 months of spending data to forecast next month's total expenses.
- **Privacy**: Your raw data for this specific model stays in your browser.

### 2. Spending Patterns
- **Technology**: Algorithmic Analysis (Client-side)
- **Functionality**: Analyzes transaction timestamps to detect behavioral patterns, such as:
    - "Weekend Spender" vs "Weekday Spender"
    - "Early Month" vs "Late Month" spending habits.

### 3. Anomaly Detection (AI-Powered)
- **Technology**: Google Gemini 1.5 Flash (Server-side)
- **Endpoint**: `GET /api/ai/anomalies`
- **Functionality**: The backend scans your recent transactions and uses a statistical heuristic + AI verification to identify outliers (e.g., unusually high bills or double charges).

### 4. AI Financial Advisor
- **Technology**: Google Gemini 1.5 Flash (Server-side)
- **Endpoint**: `GET /api/ai/insights`
- **Functionality**: Generates a personalized financial summary, pointing out top spending categories, savings opportunities, and budget recommendations in natural language.

## Configuration

To enable the server-side AI features (Advisor & Anomalies), you must provide a Google Gemini API key.

1.  Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey).
2.  Open `backend/src/main/resources/application.properties`.
3.  Set the key:
    ```properties
    gemini.api.key=YOUR_API_KEY_HERE
    ```
4.  Restart the backend server.

## Troubleshooting

-   **"No analysis available yet"**: Check if your backend server is running and the API key is valid.
-   **"Training neural network..." stuck**: Ensure you have at least a few months of expense data. The model needs data points to train.
-   **Performance**: The initial analysis might take 2-3 seconds as it calls the external AI API.
