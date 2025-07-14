import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Minus, Target, Zap, Eye, BarChart3, Activity, X, Save, Edit3, Upload, Image as ImageIcon } from 'lucide-react';

export interface TechnicalZone {
  id: string;
  type: 'support' | 'resistance' | 'demand' | 'supply' | 'golden_zone' | 'order_block' | 'fvg' | 'liquidity' | 'broken_resistance' | 'hvn' | 'multiple_nodes' | 'blue_nodes' | 'yellow_clusters' | 'unfinished_business' | 'support_resistance' | 'demand_supply';
  name: string;
  startPrice: number;
  endPrice: number;
  strength: 'strong' | 'medium' | 'weak';
  breakStrength?: 'strong' | 'medium' | 'weak';
  position?: 'above_golden' | 'below_golden' | 'cheap_zone' | 'expensive_zone';
  liquidityType?: 'double_bottom' | 'liquidity_sweep';
  orderBlockRelation?: 'above_fvg' | 'below_fvg';
  notes: string;
  date: string;
  active: boolean;
}

export interface FootprintPattern {
  id: string;
  type: 'hvn' | 'multiple_nodes' | 'blue_nodes' | 'yellow_clusters' | 'unfinished_business';
  startPrice: number;
  endPrice: number;
  description: string;
  significance: 'high' | 'medium' | 'low';
  date: string;
}

export interface MarketStructure {
  trend: 'uptrend' | 'downtrend' | 'ranging';
  confidence: number;
  lastUpdated: string;
  notes: string;
}

export interface MarketStructureImage {
  id: string;
  url: string;
  description: string;
  date: string;
}

interface TechnicalAnalysisProps {
  onComplete: () => void;
  zones?: TechnicalZone[];
  onZonesChange?: (zones: TechnicalZone[]) => void;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ 
  onComplete, 
  zones: externalZones, 
  onZonesChange 
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  const [marketStructure, setMarketStructure] = useState<MarketStructure>({
    trend: 'ranging',
    confidence: 50,
    lastUpdated: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [marketStructureImages, setMarketStructureImages] = useState<MarketStructureImage[]>([
    {
      id: '1',
      url: '/placeholder-chart.jpg',
      description: 'Market Structure Analysis Chart',
      date: '2024-01-21'
    }
  ]);

  const [technicalZones, setTechnicalZones] = useState<TechnicalZone[]>(
    externalZones || [
      {
        id: '1',
        type: 'support',
        name: 'Major Support Level',
        startPrice: 2020.50,
        endPrice: 2022.30,
        strength: 'strong',
        notes: 'Multiple touches, strong reaction zone',
        date: '2024-01-20',
        active: true
      },
      {
        id: '2',
        type: 'golden_zone',
        name: 'Golden Zone 61.8%',
        startPrice: 2035.20,
        endPrice: 2038.90,
        strength: 'medium',
        breakStrength: 'strong',
        notes: 'Fibonacci retracement level with strong break',
        date: '2024-01-21',
        active: true
      }
    ]
  );

  const [footprintPatterns, setFootprintPatterns] = useState<FootprintPattern[]>([
    {
      id: '1',
      type: 'hvn',
      startPrice: 2032.80,
      endPrice: 2034.20,
      description: 'High volume node at resistance',
      significance: 'high',
      date: '2024-01-21'
    }
  ]);

  const [newZone, setNewZone] = useState<{
    type: TechnicalZone['type'];
    name: string;
    startPrice: number;
    endPrice: number;
    strength: 'strong' | 'medium' | 'weak';
    breakStrength: 'strong' | 'medium' | 'weak';
    position: 'above_golden' | 'below_golden' | 'cheap_zone' | 'expensive_zone';
    liquidityType: 'double_bottom' | 'liquidity_sweep';
    orderBlockRelation: 'above_fvg' | 'below_fvg';
    notes: string;
  }>({
    type: 'support',
    name: '',
    startPrice: 0,
    endPrice: 0,
    strength: 'medium',
    breakStrength: 'medium',
    position: 'above_golden',
    liquidityType: 'double_bottom',
    orderBlockRelation: 'above_fvg',
    notes: ''
  });

  const [newPattern, setNewPattern] = useState<{
    type: FootprintPattern['type'];
    startPrice: number;
    endPrice: number;
    description: string;
    significance: 'high' | 'medium' | 'low';
  }>({
    type: 'hvn',
    startPrice: 0,
    endPrice: 0,
    description: '',
    significance: 'medium'
  });

  const [newImage, setNewImage] = useState({
    url: '',
    description: ''
  });

  const analysisSteps = [
    {
      id: 1,
      title: 'Market Structure Assessment',
      description: 'Analyze market structure, upload charts, and assess overall direction',
      icon: BarChart3
    },
    {
      id: 2,
      title: 'Key Zones Identification',
      description: 'Mark support, resistance, and critical trading zones',
      icon: Target
    },
    {
      id: 3,
      title: 'Zone Relationships',
      description: 'Analyze relationships between different zones',
      icon: Activity
    },
    {
      id: 4,
      title: 'NinjaTrader Setup',
      description: 'Transfer zones to NinjaTrader and prepare charts',
      icon: BarChart3
    },
    {
      id: 5,
      title: 'Footprint Analysis',
      description: 'Analyze volume patterns and market microstructure',
      icon: Activity
    }
  ];

  const handleAddZone = () => {
    if (newZone.name && newZone.startPrice && newZone.endPrice) {
      const zone: TechnicalZone = {
        id: Date.now().toString(),
        type: newZone.type,
        name: newZone.name,
        startPrice: newZone.startPrice,
        endPrice: newZone.endPrice,
        strength: newZone.strength,
        breakStrength: newZone.type === 'golden_zone' ? newZone.breakStrength : undefined,
        position: newZone.type === 'order_block' ? newZone.position : undefined,
        liquidityType: newZone.type === 'liquidity' ? newZone.liquidityType : undefined,
        orderBlockRelation: newZone.type === 'fvg' ? newZone.orderBlockRelation : undefined,
        notes: newZone.notes,
        date: new Date().toISOString().split('T')[0],
        active: true
      };
      const updatedZones = [...technicalZones, zone];
      setTechnicalZones(updatedZones);
      if (onZonesChange) {
        onZonesChange(updatedZones);
      }
      setNewZone({
        type: 'support',
        name: '',
        startPrice: 0,
        endPrice: 0,
        strength: 'medium',
        breakStrength: 'medium',
        position: 'above_golden',
        liquidityType: 'double_bottom',
        orderBlockRelation: 'above_fvg',
        notes: ''
      });
      setShowAddZone(false);
    }
  };

  const handleAddPattern = () => {
    if (newPattern.description && newPattern.startPrice && newPattern.endPrice) {
      const pattern: FootprintPattern = {
        id: Date.now().toString(),
        type: newPattern.type,
        startPrice: newPattern.startPrice,
        endPrice: newPattern.endPrice,
        description: newPattern.description,
        significance: newPattern.significance,
        date: new Date().toISOString().split('T')[0]
      };
      setFootprintPatterns([...footprintPatterns, pattern]);
      setNewPattern({
        type: 'hvn',
        startPrice: 0,
        endPrice: 0,
        description: '',
        significance: 'medium'
      });
      setShowAddPattern(false);
    }
  };

  const handleAddImage = () => {
    if (newImage.url && newImage.description) {
      const image: MarketStructureImage = {
        id: Date.now().toString(),
        url: newImage.url,
        description: newImage.description,
        date: new Date().toISOString().split('T')[0]
      };
      setMarketStructureImages([...marketStructureImages, image]);
      setNewImage({
        url: '',
        description: ''
      });
      setShowImageUpload(false);
    }
  };

  const removeZone = (id: string) => {
    const updatedZones = technicalZones.filter(zone => zone.id !== id);
    setTechnicalZones(updatedZones);
    if (onZonesChange) {
      onZonesChange(updatedZones);
    }
  };

  const removePattern = (id: string) => {
    setFootprintPatterns(footprintPatterns.filter(pattern => pattern.id !== id));
  };

  const removeImage = (id: string) => {
    setMarketStructureImages(marketStructureImages.filter(image => image.id !== id));
  };

  const getZoneColor = (type: string) => {
    const colors = {
      support: 'bg-green-900/20 border-green-500 text-green-400',
      resistance: 'bg-red-900/20 border-red-500 text-red-400',
      demand: 'bg-blue-900/20 border-blue-500 text-blue-400',
      supply: 'bg-orange-900/20 border-orange-500 text-orange-400',
      golden_zone: 'bg-yellow-900/20 border-yellow-500 text-yellow-400',
      order_block: 'bg-purple-900/20 border-purple-500 text-purple-400',
      fvg: 'bg-cyan-900/20 border-cyan-500 text-cyan-400',
      liquidity: 'bg-pink-900/20 border-pink-500 text-pink-400',
      broken_resistance: 'bg-gray-900/20 border-gray-500 text-gray-400',
      hvn: 'bg-indigo-900/20 border-indigo-500 text-indigo-400',
      multiple_nodes: 'bg-teal-900/20 border-teal-500 text-teal-400',
      blue_nodes: 'bg-blue-900/20 border-blue-500 text-blue-400',
      yellow_clusters: 'bg-yellow-900/20 border-yellow-500 text-yellow-400',
      unfinished_business: 'bg-red-900/20 border-red-500 text-red-400',
      support_resistance: 'bg-green-900/20 border-green-500 text-green-400',
      demand_supply: 'bg-blue-900/20 border-blue-500 text-blue-400'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-900/20 border-gray-500 text-gray-400';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'weak': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPatternColor = (type: string) => {
    const colors = {
      hvn: 'bg-red-900/20 border-red-500 text-red-400',
      multiple_nodes: 'bg-blue-900/20 border-blue-500 text-blue-400',
      blue_nodes: 'bg-blue-900/20 border-blue-500 text-blue-400',
      yellow_clusters: 'bg-yellow-900/20 border-yellow-500 text-yellow-400',
      unfinished_business: 'bg-purple-900/20 border-purple-500 text-purple-400'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-900/20 border-gray-500 text-gray-400';
  };

  const renderMarketStructure = () => (
    <div className="space-y-6">
      {/* Market Structure Overview */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Market Structure Assessment</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Current Trend</label>
            <div className="flex space-x-3">
              {['uptrend', 'downtrend', 'ranging'].map(trend => (
                <button
                  key={trend}
                  onClick={() => setMarketStructure({...marketStructure, trend: trend as any})}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    marketStructure.trend === trend
                      ? trend === 'uptrend' ? 'bg-green-600 text-white'
                        : trend === 'downtrend' ? 'bg-red-600 text-white'
                        : 'bg-yellow-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {trend === 'uptrend' && <TrendingUp className="w-4 h-4" />}
                  {trend === 'downtrend' && <TrendingDown className="w-4 h-4" />}
                  {trend === 'ranging' && <Minus className="w-4 h-4" />}
                  <span className="capitalize">{trend}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Confidence Level: {marketStructure.confidence}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={marketStructure.confidence}
              onChange={(e) => setMarketStructure({...marketStructure, confidence: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Analysis Notes</label>
          <textarea
            value={marketStructure.notes}
            onChange={(e) => setMarketStructure({...marketStructure, notes: e.target.value})}
            className="w-full bg-gray-600 text-white rounded-lg px-3 py-2"
            rows={3}
            placeholder="Market structure observations, key levels, trend confirmation signals..."
          />
        </div>
      </div>

      {/* Market Structure Images */}
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Market Structure Images</h3>
          <button
            onClick={() => setShowImageUpload(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Add Image</span>
          </button>
        </div>

        {/* Image Upload Modal */}
        {showImageUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-bold text-white mb-4">Add Market Structure Image</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={newImage.url}
                    onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="Enter image URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <input
                    type="text"
                    value={newImage.description}
                    onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="Describe the chart/image"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddImage}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Image
                  </button>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Display Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketStructureImages.map(image => (
            <div key={image.id} className="bg-gray-600 rounded-lg p-4 relative">
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="aspect-video bg-gray-500 rounded-lg mb-3 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">{image.description}</h4>
              <p className="text-sm text-gray-400">{image.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Structure Summary */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Market Structure Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Total Zones</h4>
            <p className="text-2xl font-bold text-blue-400">{technicalZones.length}</p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Strong Zones</h4>
            <p className="text-2xl font-bold text-green-400">
              {technicalZones.filter(z => z.strength === 'strong').length}
            </p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Active Zones</h4>
            <p className="text-2xl font-bold text-yellow-400">
              {technicalZones.filter(z => z.active).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeyZones = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Key Trading Zones</h3>
        <button
          onClick={() => setShowAddZone(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Zone</span>
        </button>
      </div>

      {/* Add Zone Modal */}
      {showAddZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white">Add Technical Zone</h4>
              <button
                onClick={() => setShowAddZone(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Zone Type</label>
                <select
                  value={newZone.type}
                  onChange={(e) => setNewZone({...newZone, type: e.target.value as any})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="support">Support Level</option>
                  <option value="resistance">Resistance Level</option>
                  <option value="demand">Demand Zone</option>
                  <option value="supply">Supply Zone</option>
                  <option value="support_resistance">Support & Resistance Levels</option>
                  <option value="demand_supply">Demand & Supply Zones</option>
                  <option value="golden_zone">Golden Zone</option>
                  <option value="order_block">Order Block</option>
                  <option value="fvg">Fair Value Gap (FVG)</option>
                  <option value="liquidity">Liquidity Zone</option>
                  <option value="broken_resistance">Previous Broken Resistance</option>
                  <option value="hvn">High Volume Node (HVN)</option>
                  <option value="multiple_nodes">Multiple Nodes</option>
                  <option value="blue_nodes">Blue Nodes</option>
                  <option value="yellow_clusters">Yellow Clusters</option>
                  <option value="unfinished_business">Unfinished Business</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={newZone.name}
                    onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    placeholder="Zone name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newZone.startPrice || ''}
                    onChange={(e) => setNewZone({...newZone, startPrice: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">End Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newZone.endPrice || ''}
                  onChange={(e) => setNewZone({...newZone, endPrice: parseFloat(e.target.value) || 0})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Strength</label>
                <select
                  value={newZone.strength}
                  onChange={(e) => setNewZone({...newZone, strength: e.target.value as any})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="strong">Strong</option>
                  <option value="medium">Medium</option>
                  <option value="weak">Weak</option>
                </select>
              </div>
              {newZone.type === 'order_block' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                  <select
                    value={newZone.position}
                    onChange={(e) => setNewZone({...newZone, position: e.target.value as any})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="above_golden">Above Golden Zone</option>
                    <option value="below_golden">Below Golden Zone</option>
                    <option value="cheap_zone">Cheap Zone</option>
                    <option value="expensive_zone">Expensive Zone</option>
                  </select>
                </div>
              )}
              {newZone.type === 'golden_zone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Break Strength</label>
                  <select
                    value={newZone.breakStrength}
                    onChange={(e) => setNewZone({...newZone, breakStrength: e.target.value as any})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="strong">Strong</option>
                    <option value="medium">Medium</option>
                    <option value="weak">Weak</option>
                  </select>
                </div>
              )}
              {newZone.type === 'fvg' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Order Block Relation</label>
                  <select
                    value={newZone.orderBlockRelation}
                    onChange={(e) => setNewZone({...newZone, orderBlockRelation: e.target.value as any})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="above_fvg">Order Block Above FVG</option>
                    <option value="below_fvg">Order Block Below FVG</option>
                  </select>
                </div>
              )}
              {newZone.type === 'liquidity' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Liquidity Type</label>
                  <select
                    value={newZone.liquidityType}
                    onChange={(e) => setNewZone({...newZone, liquidityType: e.target.value as any})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="double_bottom">Double Bottom</option>
                    <option value="liquidity_sweep">Liquidity Sweep</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                <textarea
                  value={newZone.notes}
                  onChange={(e) => setNewZone({...newZone, notes: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  rows={3}
                  placeholder="Additional notes about this zone..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddZone}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Zone
                </button>
                <button
                  onClick={() => setShowAddZone(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zones List */}
      <div className="space-y-3">
        {technicalZones.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No technical zones marked yet</p>
            <p className="text-sm">Add zones to track key levels</p>
          </div>
        ) : (
          technicalZones.map(zone => (
            <div key={zone.id} className={`border rounded-lg p-4 ${getZoneColor(zone.type)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{zone.name}</h4>
                  <p className="text-sm opacity-80">Price Range: {zone.startPrice} - {zone.endPrice}</p>
                  <p className="text-xs opacity-70">Range: {(zone.endPrice - zone.startPrice).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor(zone.strength)}`}>
                    {zone.strength.toUpperCase()}
                  </span>
                  {zone.breakStrength && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-500">
                      Break: {zone.breakStrength}
                    </span>
                  )}
                  <button
                    onClick={() => removeZone(zone.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {zone.position && (
                  <div>
                    <span className="text-gray-400">Position:</span>
                    <div className="font-medium capitalize">{zone.position.replace('_', ' ')}</div>
                  </div>
                )}
                {zone.liquidityType && (
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <div className="font-medium capitalize">{zone.liquidityType.replace('_', ' ')}</div>
                  </div>
                )}
                {zone.orderBlockRelation && (
                  <div>
                    <span className="text-gray-400">Order Block:</span>
                    <div className="font-medium capitalize">{zone.orderBlockRelation.replace('_', ' ')}</div>
                  </div>
                )}
              </div>
              {zone.notes && (
                <p className="text-sm opacity-80 mt-2">{zone.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderZoneRelationships = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Zone Relationships Analysis</h3>
        
        {/* Golden Zone Analysis */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-yellow-400 mb-3">Golden Zone Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalZones.filter(z => z.type === 'golden_zone').map(zone => (
              <div key={zone.id} className="bg-gray-600 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">{zone.name}</h5>
                <div className="space-y-2 text-sm">
                  <div>Price Range: {zone.startPrice} - {zone.endPrice}</div>
                  <div>Break Strength: <span className={getStrengthColor(zone.breakStrength || 'medium')}>{zone.breakStrength}</span></div>
                  <div>Notes: {zone.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Blocks Analysis */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">Order Blocks Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalZones.filter(z => z.type === 'order_block').map(zone => (
              <div key={zone.id} className="bg-gray-600 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">{zone.name}</h5>
                <div className="space-y-2 text-sm">
                  <div>Price Range: {zone.startPrice} - {zone.endPrice}</div>
                  <div>Position: <span className="capitalize">{zone.position?.replace('_', ' ')}</span></div>
                  <div>Strength: <span className={getStrengthColor(zone.strength)}>{zone.strength}</span></div>
                  <div>Notes: {zone.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FVG Analysis */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-cyan-400 mb-3">Fair Value Gaps (FVG) Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalZones.filter(z => z.type === 'fvg').map(zone => (
              <div key={zone.id} className="bg-gray-600 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">{zone.name}</h5>
                <div className="space-y-2 text-sm">
                  <div>Price Range: {zone.startPrice} - {zone.endPrice}</div>
                  <div>Order Block: <span className="capitalize">{zone.orderBlockRelation?.replace('_', ' ')}</span></div>
                  <div>Strength: <span className={getStrengthColor(zone.strength)}>{zone.strength}</span></div>
                  <div>Notes: {zone.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liquidity Analysis */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-pink-400 mb-3">Liquidity Zones Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalZones.filter(z => z.type === 'liquidity').map(zone => (
              <div key={zone.id} className="bg-gray-600 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">{zone.name}</h5>
                <div className="space-y-2 text-sm">
                  <div>Price Range: {zone.startPrice} - {zone.endPrice}</div>
                  <div>Type: <span className="capitalize">{zone.liquidityType?.replace('_', ' ')}</span></div>
                  <div>Strength: <span className={getStrengthColor(zone.strength)}>{zone.strength}</span></div>
                  <div>Notes: {zone.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-gray-600 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Zone Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Zones:</span>
              <div className="font-medium text-white">{technicalZones.length}</div>
            </div>
            <div>
              <span className="text-gray-400">Strong Zones:</span>
              <div className="font-medium text-green-400">{technicalZones.filter(z => z.strength === 'strong').length}</div>
            </div>
            <div>
              <span className="text-gray-400">Golden Zones:</span>
              <div className="font-medium text-yellow-400">{technicalZones.filter(z => z.type === 'golden_zone').length}</div>
            </div>
            <div>
              <span className="text-gray-400">Order Blocks:</span>
              <div className="font-medium text-purple-400">{technicalZones.filter(z => z.type === 'order_block').length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNinjaTraderSetup = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">NinjaTrader Setup Checklist</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded" />
            <span className="text-gray-300">Transfer all marked zones to NinjaTrader charts</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded" />
            <span className="text-gray-300">Mark arrows on each important order block</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded" />
            <span className="text-gray-300">Open daily footprint chart</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded" />
            <span className="text-gray-300">Adjust aggregation ticks for optimal view</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded" />
            <span className="text-gray-300">Prepare volume profile indicators</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
          <h4 className="font-semibold text-blue-400 mb-2">Setup Notes</h4>
          <textarea
            className="w-full bg-gray-600 text-white rounded-lg px-3 py-2"
            rows={3}
            placeholder="NinjaTrader setup notes, chart configurations, indicator settings..."
          />
        </div>
      </div>
    </div>
  );

  const renderFootprintAnalysis = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Footprint Analysis</h3>
        <button
          onClick={() => setShowAddPattern(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pattern</span>
        </button>
      </div>

      {/* Add Pattern Modal */}
      {showAddPattern && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white">Add Footprint Pattern</h4>
              <button
                onClick={() => setShowAddPattern(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Pattern Type</label>
                <select
                  value={newPattern.type}
                  onChange={(e) => setNewPattern({...newPattern, type: e.target.value as any})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="hvn">High Volume Node (HVN)</option>
                  <option value="multiple_nodes">Multiple Nodes</option>
                  <option value="blue_nodes">Blue Nodes</option>
                  <option value="yellow_clusters">Yellow Clusters</option>
                  <option value="unfinished_business">Unfinished Business</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPattern.startPrice || ''}
                    onChange={(e) => setNewPattern({...newPattern, startPrice: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPattern.endPrice || ''}
                    onChange={(e) => setNewPattern({...newPattern, endPrice: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Significance</label>
                <select
                  value={newPattern.significance}
                  onChange={(e) => setNewPattern({...newPattern, significance: e.target.value as any})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={newPattern.description}
                  onChange={(e) => setNewPattern({...newPattern, description: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  rows={3}
                  placeholder="Pattern details, volume characteristics, market implications..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddPattern}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Pattern
                </button>
                <button
                  onClick={() => setShowAddPattern(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footprint Patterns Guide */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="font-semibold text-white mb-4">Key Footprint Patterns to Look For</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-300"><strong>High Volume Nodes (HVN):</strong> Areas of significant trading activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-300"><strong>Multiple Nodes:</strong> Clustered volume areas indicating consolidation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-300"><strong>Blue Nodes:</strong> Buyer-dominated volume areas</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-300"><strong>Yellow Clusters:</strong> Balanced buying/selling pressure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-300"><strong>Unfinished Business:</strong> Incomplete auction areas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patterns List */}
      <div className="space-y-3">
        {footprintPatterns.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No footprint patterns identified yet</p>
            <p className="text-sm">Add patterns from your NinjaTrader analysis</p>
          </div>
        ) : (
          footprintPatterns.map(pattern => (
            <div key={pattern.id} className={`border rounded-lg p-4 ${getPatternColor(pattern.type)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{pattern.type.replace('_', ' ').toUpperCase()}</h4>
                  <p className="text-sm opacity-80">Price: {pattern.startPrice} - {pattern.endPrice}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor(pattern.significance)}`}>
                    {pattern.significance.toUpperCase()}
                  </span>
                  <button
                    onClick={() => removePattern(pattern.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm opacity-80">{pattern.description}</p>
              <p className="text-xs opacity-60 mt-2">Identified: {pattern.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Update external zones when internal zones change
  useEffect(() => {
    if (onZonesChange) {
      onZonesChange(technicalZones);
    }
  }, [technicalZones, onZonesChange]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
          Technical Analysis
        </h2>
        <button
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Complete Analysis</span>
        </button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {analysisSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    activeStep === step.id
                      ? 'bg-blue-600 text-white'
                      : activeStep > step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
                {index < analysisSteps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    activeStep > step.id ? 'bg-green-600' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">
            {analysisSteps.find(s => s.id === activeStep)?.title}
          </h3>
          <p className="text-sm text-gray-400">
            {analysisSteps.find(s => s.id === activeStep)?.description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="transition-all duration-300">
        {activeStep === 1 && renderMarketStructure()}
        {activeStep === 2 && renderKeyZones()}
        {activeStep === 3 && renderZoneRelationships()}
        {activeStep === 4 && renderNinjaTraderSetup()}
        {activeStep === 5 && renderFootprintAnalysis()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
          disabled={activeStep === 5}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;