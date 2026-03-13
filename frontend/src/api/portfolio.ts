import { api } from './client';

export interface PortfolioSummary {
  portfolio_id: string;
  portfolio_name: string;
  total_value: string;
  total_invested: string;
  global_pnl: string;
  global_pnl_percent: string;
  total_dividends_received: string;
}

export interface PortfolioResponse {
  id: string;
  user_id: string;
  name: string;
}

export interface PositionResponse {
  id: string;
  portfolio_id: string;
  asset_ticker: string;
  quantity: string;
  average_buy_price: string;
  asset_name: string;
  asset_type: string;
  currency_code: string;
  current_price: string;
  dividends_received: string;
}

export interface PriceHistoryPoint {
  timestamp: string;
  price: string;
}

export interface PriceHistoryListResponse {
  ticker: string;
  count: number;
  history: PriceHistoryPoint[];
}

export async function listPortfolios(): Promise<PortfolioResponse[]> {
  const response = await api.get<PortfolioResponse[]>('/portfolios/');
  return response.data;
}

export async function getPortfolioSummary(portfolioId: string): Promise<PortfolioSummary> {
  const response = await api.get<PortfolioSummary>(`/portfolios/${portfolioId}/summary`);
  return response.data;
}

export async function getPortfolioPositions(portfolioId: string): Promise<PositionResponse[]> {
  const response = await api.get<PositionResponse[]>(`/portfolios/${portfolioId}/positions`);
  return response.data;
}

export async function getAssetHistory(ticker: string): Promise<PriceHistoryListResponse> {
  const response = await api.get<PriceHistoryListResponse>(`/assets/${ticker}/history`);
  return response.data;
}

export async function createPortfolio(name: string): Promise<PortfolioResponse> {
  const response = await api.post<PortfolioResponse>('/portfolios/', {
    name,
    description: '',
  });
  return response.data;
}

