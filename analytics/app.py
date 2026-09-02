"""
====================================================================
BUSINESS ANALYTICS SYSTEM - FLASK ANALYTICS REST API MICROSERVICE
====================================================================
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from analytics_engine import AdvancedAnalyticsEngine

app = Flask(__name__)
CORS(app)

engine = AdvancedAnalyticsEngine()


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "UP",
        "service": "Python Business Analytics Engine",
        "version": "2.0.0",
        "capabilities": ["Time-series Forecasting", "Product Performance", "Profit Decomposition", "NumPy", "Pandas"]
    })


@app.route('/analytics/forecast', methods=['GET', 'POST'])
def get_sales_forecast():
    """Returns dynamic sales and revenue forecast."""
    data = request.get_json(silent=True) or {}
    custom_sales = data.get('sales_series')
    days = int(data.get('days', request.args.get('days', 7)))
    
    result = engine.forecast_sales_and_revenue(custom_sales=custom_sales, forecast_days=days)
    return jsonify({"success": True, "data": result})


@app.route('/analytics/products-performance', methods=['GET', 'POST'])
def get_products_performance():
    """Ranks products by sales contribution and low performance."""
    data = request.get_json(silent=True) or {}
    products = data.get('products')
    
    result = engine.analyze_product_performance(products_data=products)
    return jsonify({"success": True, "data": result})


@app.route('/analytics/profit-analysis', methods=['GET', 'POST'])
def get_profit_analysis():
    """Computes margin ratios and profitability score."""
    data = request.get_json(silent=True) or {}
    rev = float(data.get('revenue', request.args.get('revenue', 318916.0)))
    cost = float(data.get('cost', request.args.get('cost', 170600.0)))
    exp = float(data.get('expenses', request.args.get('expenses', 47000.0)))
    
    result = engine.compute_profit_insights(revenue=rev, total_cost=cost, expenses=exp)
    return jsonify({"success": True, "data": result})


@app.route('/analytics/summary', methods=['GET'])
def get_full_summary():
    """Combined executive analytics overview."""
    forecast = engine.forecast_sales_and_revenue(forecast_days=7)
    products = engine.analyze_product_performance()
    profit = engine.compute_profit_insights()
    
    return jsonify({
        "success": True,
        "timestamp": "2026-08-29T20:55:00Z",
        "forecast": forecast,
        "products": products,
        "profit_insights": profit
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Python Analytics Microservice running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
