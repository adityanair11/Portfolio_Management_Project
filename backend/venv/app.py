from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'portfolio.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    portfolios = db.relationship('Portfolio', backref='user', lazy=True, cascade='all, delete-orphan')

class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    holdings = db.relationship('Holding', backref='portfolio', lazy=True, cascade='all, delete-orphan')

class Holding(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    asset_name = db.Column(db.String(200), nullable=False)
    symbol = db.Column(db.String(50), nullable=False)
    asset_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    buy_price = db.Column(db.Float, nullable=False)
    current_price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='INR')  # THIS LINE IS CRITICAL
    market = db.Column(db.String(50))
    sector = db.Column(db.String(100))
    buy_date = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize database
with app.app_context():
    db.create_all()
    
    # Create default user and portfolio if they don't exist
    default_user = User.query.filter_by(email='demo@example.com').first()
    if not default_user:
        default_user = User(email='demo@example.com', name='Demo User')
        db.session.add(default_user)
        db.session.commit()
        
        default_portfolio = Portfolio(
            user_id=default_user.id,
            name='My Portfolio',
            description='Default portfolio'
        )
        db.session.add(default_portfolio)
        db.session.commit()
        
        # Add sample holdings
        sample_holdings = [
            Holding(
                portfolio_id=default_portfolio.id,
                asset_name='Reliance Industries',
                symbol='RELIANCE',
                asset_type='Stock',
                quantity=50,
                buy_price=2400,
                current_price=2650
            ),
            Holding(
                portfolio_id=default_portfolio.id,
                asset_name='TCS',
                symbol='TCS',
                asset_type='Stock',
                quantity=30,
                buy_price=3200,
                current_price=3450
            ),
            Holding(
                portfolio_id=default_portfolio.id,
                asset_name='HDFC Mutual Fund',
                symbol='HDFCMF',
                asset_type='Mutual Fund',
                quantity=100,
                buy_price=450,
                current_price=485
            )
        ]
        
        for holding in sample_holdings:
            db.session.add(holding)
        db.session.commit()

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'API is running'}), 200

@app.route('/api/holdings', methods=['GET'])
def get_holdings():
    try:
        holdings = Holding.query.all()
        return jsonify([{
            'id': h.id,
            'name': h.asset_name,
            'symbol': h.symbol,
            'type': h.asset_type,
            'quantity': h.quantity,
            'buyPrice': h.buy_price,  # Return as-is, no conversion
            'currentPrice': h.current_price,  # Return as-is, no conversion
            'currency': h.currency,
            'market': h.market,
            'sector': h.sector
        } for h in holdings])
    except Exception as e:
        print(f"Error fetching holdings: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/holdings', methods=['POST'])
def add_holding():
    try:
        data = request.json
        
        # Get the first portfolio (or create one)
        portfolio = Portfolio.query.first()
        if not portfolio:
            user = User.query.first()
            if not user:
                user = User(email='demo@onestock.com', name='Demo User')
                db.session.add(user)
                db.session.commit()
            
            portfolio = Portfolio(user_id=user.id, name='My Portfolio')
            db.session.add(portfolio)
            db.session.commit()
        
        # Create new holding - NO CONVERSION, store exactly as sent
        new_holding = Holding(
            portfolio_id=portfolio.id,
            asset_name=data.get('name'),
            symbol=data.get('symbol'),
            asset_type=data.get('type', 'Stock'),
            quantity=float(data.get('quantity')),
            buy_price=float(data.get('buyPrice')),  # Store as-is, no conversion
            current_price=float(data.get('currentPrice')),  # Store as-is, no conversion
            currency=data.get('currency', 'INR'),
            market=data.get('market'),
            sector=data.get('sector')
        )
        
        db.session.add(new_holding)
        db.session.commit()
        
        return jsonify({
            'id': new_holding.id,
            'name': new_holding.asset_name,
            'symbol': new_holding.symbol,
            'type': new_holding.asset_type,
            'quantity': new_holding.quantity,
            'buyPrice': new_holding.buy_price,
            'currentPrice': new_holding.current_price,
            'currency': new_holding.currency,
            'market': new_holding.market,
            'sector': new_holding.sector
        }), 201
        
    except Exception as e:
        print(f"Error adding holding: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/holdings/<int:holding_id>', methods=['PUT'])
def update_holding(holding_id):
    holding = Holding.query.get(holding_id)
    if not holding:
        return jsonify({'error': 'Holding not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        holding.asset_name = data['name']
    if 'symbol' in data:
        holding.symbol = data['symbol'].upper()
    if 'type' in data:
        holding.asset_type = data['type']
    if 'quantity' in data:
        holding.quantity = float(data['quantity'])
    if 'buyPrice' in data:
        holding.buy_price = float(data['buyPrice'])
    if 'currentPrice' in data:
        holding.current_price = float(data['currentPrice'])
    
    db.session.commit()
    
    return jsonify({
        'id': holding.id,
        'name': holding.asset_name,
        'symbol': holding.symbol,
        'type': holding.asset_type,
        'quantity': holding.quantity,
        'buyPrice': holding.buy_price,
        'currentPrice': holding.current_price
    }), 200

@app.route('/api/holdings/<int:holding_id>', methods=['DELETE'])
def delete_holding(holding_id):
    holding = Holding.query.get(holding_id)
    if not holding:
        return jsonify({'error': 'Holding not found'}), 404
    
    db.session.delete(holding)
    db.session.commit()
    
    return jsonify({'message': 'Holding deleted successfully'}), 200

@app.route('/api/portfolio/metrics', methods=['GET'])
def get_portfolio_metrics():
    default_portfolio = Portfolio.query.first()
    if not default_portfolio:
        return jsonify({'error': 'No portfolio found'}), 404
    
    holdings = Holding.query.filter_by(portfolio_id=default_portfolio.id).all()
    
    total_investment = sum(h.quantity * h.buy_price for h in holdings)
    current_value = sum(h.quantity * h.current_price for h in holdings)
    total_gain_loss = current_value - total_investment
    gain_loss_percent = (total_gain_loss / total_investment * 100) if total_investment > 0 else 0
    
    return jsonify({
        'totalInvestment': round(total_investment, 2),
        'currentValue': round(current_value, 2),
        'totalGainLoss': round(total_gain_loss, 2),
        'gainLossPercent': round(gain_loss_percent, 2)
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)