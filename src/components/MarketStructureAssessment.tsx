import React, { useState } from 'react';
import { Upload, Image as ImageIcon, X, Save, Edit3, TrendingUp, TrendingDown, Minus, Target, Zap, Eye, BarChart3, Activity, Plus } from 'lucide-react';

export interface MarketStructureZone {
  id: string;
  type: 'support_resistance' | 'demand_supply' | 'golden_zone' | 'order_block' | 'fvg' | 'liquidity' | 'broken_resistance' | 'hvn' | 'multiple_nodes' | 'blue_nodes' | 'yellow_clusters' | 'unfinished_business';
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

export interface MarketStructureImage {
  id: string;
  url: string;
  description: string;
  date: string;
}

interface MarketStructureAssessmentProps {
  onComplete: () => void;
}

const MarketStructureAssessment: React.FC<MarketStructureAssessmentProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [showAddZone, setShowAddZone] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  const [marketStructureZones, setMarketStructureZones] = useState<MarketStructureZone[]>([
    {
      id: '1',
      type: 'support_resistance',
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
    },
    {
      id: '3',
      type: 'order_block',
      name: 'Bullish Order Block',
      startPrice: 2045.10,
      endPrice: 2048.70,
      strength: 'strong',
      position: 'above_golden',
      notes: 'Order block above golden zone in expensive zone',
      date: '2024-01-21',
      active: true
    }
  ]);

  const [marketStructureImages, setMarketStructureImages] = useState<MarketStructureImage[]>([
    {
      id: '1',
      url: '/placeholder-chart.jpg',
      description: 'Market Structure Analysis Chart',
      date: '2024-01-21'
    }
  ]);

  const [newZone, setNewZone] = useState<{
    type: MarketStructureZone['type'];
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
    type: 'support_resistance',
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

  const [newImage, setNewImage] = useState({
    url: '',
    description: ''
  });

  const analysisSteps = [
    {
      id: 1,
      title: 'Market Structure Overview',
      description: 'Upload chart images and assess overall market structure',
      icon: BarChart3
    },
    {
      id: 2,
      title: 'Zone Analysis',
      description: 'Identify and mark all trading zones with price ranges',
      icon: Target
    },
    {
      id: 3,
      title: 'Zone Relationships',
      description: 'Analyze relationships between different zones',
      icon: Activity
    }
  ];

  const zoneTypes = [
    { value: 'support_resistance', label: 'Support & Resistance Levels' },
    { value: 'demand_supply', label: 'Demand & Supply Zones' },
    { value: 'golden_zone', label: 'Golden Zone' },
    { value: 'order_block', label: 'Order Blocks' },
    { value: 'fvg', label: 'Fair Value Gaps (FVG)' },
    { value: 'liquidity', label: 'Liquidity Zones' },
    { value: 'broken_resistance', label: 'Previous Broken Resistance' },
    { value: 'hvn', label: 'High Volume Nodes (HVN)' },
    { value: 'multiple_nodes', label: 'Multiple Nodes' },
    { value: 'blue_nodes', label: 'Blue Nodes' },
    { value: 'yellow_clusters', label: 'Yellow Clusters' },
    { value: 'unfinished_business', label: 'Unfinished Business' }
  ];

  const handleAddZone = () => {
    if (newZone.name && newZone.startPrice && newZone.endPrice) {
      const zone: MarketStructureZone = {
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
      setMarketStructureZones([...marketStructureZones, zone]);
      setNewZone({
        type: 'support_resistance',
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
    setMarketStructureZones(marketStructureZones.filter(zone => zone.id !== id));
  };

  const removeImage = (id: string) => {
    setMarketStructureImages(marketStructureImages.filter(image => image.id !== id));
  };

  const getZoneColor = (type: string) => {
    const colors = {
      support_resistance: 'bg-green-900/20 border-green-500 text-green-400',
      demand_supply: 'bg-blue-900/20 border-blue-500 text-blue-400',
      golden_zone: 'bg-yellow-900/20 border-yellow-500 text-yellow-400',
      order_block: 'bg-purple-900/20 border-purple-500 text-purple-400',
      fvg: 'bg-cyan-900/20 border-cyan-500 text-cyan-400',
      liquidity: 'bg-pink-900/20 border-pink-500 text-pink-400',
      broken_resistance: 'bg-gray-900/20 border-gray-500 text-gray-400',
      hvn: 'bg-indigo-900/20 border-indigo-500 text-indigo-400',
      multiple_nodes: 'bg-teal-900/20 border-teal-500 text-teal-400',
      blue_nodes: 'bg-blue-900/20 border-blue-500 text-blue-400',
      yellow_clusters: 'bg-yellow-900/20 border-yellow-500 text-yellow-400',
      unfinished_business: 'bg-red-900/20 border-red-500 text-red-400'
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

  const renderMarketStructureOverview = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
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
            <div key={image.id} className="bg-gray-700 rounded-lg p-4 relative">
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="aspect-video bg-gray-600 rounded-lg mb-3 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">{image.description}</h4>
              <p className="text-sm text-gray-400">{image.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Market Structure Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Total Zones</h4>
            <p className="text-2xl font-bold text-blue-400">{marketStructureZones.length}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Strong Zones</h4>
            <p className="text-2xl font-bold text-green-400">
              {marketStructureZones.filter(z => z.strength === 'strong').length}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Active Zones</h4>
            <p className="text-2xl font-bold text-yellow-400">
              {marketStructureZones.filter(z => z.active).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderZoneAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Market Structure Zones</h3>
          <button
            onClick={() => setShowAddZone(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Zone</span>
          </button>
        </div>

        {/* Add Zone Modal */}
        {showAddZone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h4 className="text-lg font-bold text-white mb-4">Add Market Structure Zone</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Zone Type</label>
                  <select
                    value={newZone.type}
                    onChange={(e) => setNewZone({ ...newZone, type: e.target.value as any })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    {zoneTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Zone Name</label>
                  <input
                    type="text"
                    value={newZone.name}
                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="Enter zone name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newZone.startPrice}
                    onChange={(e) => setNewZone({ ...newZone, startPrice: parseFloat(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">End Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newZone.endPrice}
                    onChange={(e) => setNewZone({ ...newZone, endPrice: parseFloat(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Strength</label>
                  <select
                    value={newZone.strength}
                    onChange={(e) => setNewZone({ ...newZone, strength: e.target.value as any })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="strong">Strong</option>
                    <option value="medium">Medium</option>
                    <option value="weak">Weak</option>
                  </select>
                </div>
                {newZone.type === 'golden_zone' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Break Strength</label>
                    <select
                      value={newZone.breakStrength}
                      onChange={(e) => setNewZone({ ...newZone, breakStrength: e.target.value as any })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="strong">Strong</option>
                      <option value="medium">Medium</option>
                      <option value="weak">Weak</option>
                    </select>
                  </div>
                )}
                {newZone.type === 'order_block' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
                    <select
                      value={newZone.position}
                      onChange={(e) => setNewZone({ ...newZone, position: e.target.value as any })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="above_golden">Above Golden Zone</option>
                      <option value="below_golden">Below Golden Zone</option>
                      <option value="cheap_zone">Cheap Zone</option>
                      <option value="expensive_zone">Expensive Zone</option>
                    </select>
                  </div>
                )}
                {newZone.type === 'liquidity' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Liquidity Type</label>
                    <select
                      value={newZone.liquidityType}
                      onChange={(e) => setNewZone({ ...newZone, liquidityType: e.target.value as any })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="double_bottom">Double Bottom</option>
                      <option value="liquidity_sweep">Liquidity Sweep</option>
                    </select>
                  </div>
                )}
                {newZone.type === 'fvg' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Order Block Relation</label>
                    <select
                      value={newZone.orderBlockRelation}
                      onChange={(e) => setNewZone({ ...newZone, orderBlockRelation: e.target.value as any })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="above_fvg">Order Block Above FVG</option>
                      <option value="below_fvg">Order Block Below FVG</option>
                    </select>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                  <textarea
                    value={newZone.notes}
                    onChange={(e) => setNewZone({ ...newZone, notes: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Additional notes about this zone..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddZone}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
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
        )}

        {/* Display Zones */}
        <div className="space-y-4">
          {marketStructureZones.map(zone => (
            <div key={zone.id} className={`border rounded-lg p-4 ${getZoneColor(zone.type)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold">{zone.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor(zone.strength)}`}>
                      {zone.strength}
                    </span>
                    {zone.breakStrength && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-500">
                        Break: {zone.breakStrength}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Price Range:</span>
                      <div className="font-medium">{zone.startPrice} - {zone.endPrice}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Range:</span>
                      <div className="font-medium">{(zone.endPrice - zone.startPrice).toFixed(2)}</div>
                    </div>
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
                    <div className="mt-2 text-sm">
                      <span className="text-gray-400">Notes:</span>
                      <div className="mt-1">{zone.notes}</div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeZone(zone.id)}
                  className="text-red-400 hover:text-red-300 ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderZoneRelationships = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Zone Relationships Analysis</h3>
        
        {/* Golden Zone Analysis */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-yellow-400 mb-3">Golden Zone Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketStructureZones.filter(z => z.type === 'golden_zone').map(zone => (
              <div key={zone.id} className="bg-gray-700 rounded-lg p-4">
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
            {marketStructureZones.filter(z => z.type === 'order_block').map(zone => (
              <div key={zone.id} className="bg-gray-700 rounded-lg p-4">
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
            {marketStructureZones.filter(z => z.type === 'fvg').map(zone => (
              <div key={zone.id} className="bg-gray-700 rounded-lg p-4">
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
            {marketStructureZones.filter(z => z.type === 'liquidity').map(zone => (
              <div key={zone.id} className="bg-gray-700 rounded-lg p-4">
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
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Zone Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Zones:</span>
              <div className="font-medium text-white">{marketStructureZones.length}</div>
            </div>
            <div>
              <span className="text-gray-400">Strong Zones:</span>
              <div className="font-medium text-green-400">{marketStructureZones.filter(z => z.strength === 'strong').length}</div>
            </div>
            <div>
              <span className="text-gray-400">Golden Zones:</span>
              <div className="font-medium text-yellow-400">{marketStructureZones.filter(z => z.type === 'golden_zone').length}</div>
            </div>
            <div>
              <span className="text-gray-400">Order Blocks:</span>
              <div className="font-medium text-purple-400">{marketStructureZones.filter(z => z.type === 'order_block').length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Market Structure Assessment</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Step {activeStep} of {analysisSteps.length}</span>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(activeStep / analysisSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysisSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  activeStep >= step.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 bg-gray-700'
                }`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activeStep >= step.id ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="transition-all duration-300">
        {activeStep === 1 && renderMarketStructureOverview()}
        {activeStep === 2 && renderZoneAnalysis()}
        {activeStep === 3 && renderZoneRelationships()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Previous
        </button>
        
        {activeStep === analysisSteps.length ? (
          <button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Complete Assessment
          </button>
        ) : (
          <button
            onClick={() => setActiveStep(Math.min(analysisSteps.length, activeStep + 1))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default MarketStructureAssessment; 