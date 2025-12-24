// src/app/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Activity, Pill, Target, Dumbbell, FileText, TrendingUp } from 'lucide-react';

export default function PhysioKGApp() {
  const [conditions, setConditions] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [reasoning, setReasoning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all conditions on mount
  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conditions');
      const data = await response.json();
      
      if (response.ok) {
        setConditions(data.conditions);
      } else {
        setError(data.error || 'Failed to load conditions');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to connect to server');
      setLoading(false);
    }
  };

  const generateReasoning = async () => {
    if (!selectedCondition) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reasoning/${encodeURIComponent(selectedCondition)}`);
      const data = await response.json();
      
      if (response.ok) {
        setReasoning(data);
      } else {
        setError(data.error || 'Failed to generate reasoning');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to connect to server');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const filteredConditions = conditions.filter(c => 
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SectionCard = ({ title, icon: Icon, children, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Clinical Reasoning Assistant
          </h1>
          <p className="text-gray-600">
            Evidence-based physiotherapy knowledge graph • Alpha Testing
          </p>
        </div>

        {/* Search and Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Conditions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search for a condition..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Condition
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a condition...</option>
                {filteredConditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generateReasoning}
              disabled={!selectedCondition || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Clinical Reasoning'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {reasoning && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-900">
                {reasoning.condition}
              </h2>
            </div>

            {/* Red Flags - Priority placement */}
            {reasoning.redFlags && reasoning.redFlags.length > 0 && (
              <SectionCard title="Red Flags" icon={AlertCircle} color="text-red-600">
                <div className="space-y-3">
                  {reasoning.redFlags.map((flag, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-gray-900">{flag.flag}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          flag.urgency === 'High' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {flag.urgency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">Action: {flag.action}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Impairments */}
            {reasoning.impairments && reasoning.impairments.length > 0 && (
              <SectionCard title="Common Impairments" icon={Activity} color="text-purple-600">
                <div className="space-y-2">
                  {reasoning.impairments.map((imp, idx) => (
                    <div key={idx} className="border-l-4 border-purple-300 pl-3 py-2">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-900">{imp.name}</p>
                        {imp.severity && <span className="text-xs text-gray-500">{imp.severity}</span>}
                      </div>
                      {imp.evidence && <p className="text-sm text-gray-600 italic">{imp.evidence}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Assessments */}
            {reasoning.assessments && reasoning.assessments.length > 0 && (
              <SectionCard title="Assessment Tools" icon={FileText} color="text-blue-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reasoning.assessments.map((assess, idx) => (
                    <div key={idx} className="border border-gray-200 rounded p-3">
                      <p className="font-medium text-gray-900">{assess.name}</p>
                      <div className="flex justify-between mt-1">
                        {assess.type && <span className="text-xs text-gray-500">{assess.type}</span>}
                        {assess.priority && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            assess.priority === 'High' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {assess.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Interventions */}
            {reasoning.interventions && reasoning.interventions.length > 0 && (
              <SectionCard title="Interventions" icon={Target} color="text-green-600">
                <div className="space-y-2">
                  {reasoning.interventions.map((int, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{int.name}</p>
                        {int.category && <p className="text-sm text-gray-600">{int.category}</p>}
                      </div>
                      {int.evidence && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {int.evidence}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Exercises */}
            {reasoning.exercises && reasoning.exercises.length > 0 && (
              <SectionCard title="Exercise Prescription" icon={Dumbbell} color="text-orange-600">
                <div className="space-y-3">
                  {reasoning.exercises.map((ex, idx) => (
                    <div key={idx} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-gray-900">{ex.name}</p>
                        {ex.phase && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {ex.phase}
                          </span>
                        )}
                      </div>
                      {ex.dosage && <p className="text-sm text-gray-600">{ex.dosage}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Medications */}
            {reasoning.medications && reasoning.medications.length > 0 && (
              <SectionCard title="Medications" icon={Pill} color="text-indigo-600">
                <div className="space-y-2">
                  {reasoning.medications.map((med, idx) => (
                    <div key={idx} className="p-3 bg-indigo-50 rounded">
                      <p className="font-medium text-gray-900">{med.name}</p>
                      {med.indication && <p className="text-sm text-gray-700">{med.indication}</p>}
                      {med.caution && <p className="text-xs text-indigo-700 mt-1">⚠️ {med.caution}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Outcome Measures */}
            {reasoning.outcomeMeasures && reasoning.outcomeMeasures.length > 0 && (
              <SectionCard title="Outcome Measures" icon={TrendingUp} color="text-teal-600">
                <div className="space-y-2">
                  {reasoning.outcomeMeasures.map((measure, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{measure.name}</p>
                        {measure.type && <p className="text-sm text-gray-600">{measure.type}</p>}
                      </div>
                      {measure.frequency && <p className="text-xs text-gray-500">{measure.frequency}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Alpha Version • For Testing Only • Evidence-based clinical reasoning</p>
        </div>
      </div>
    </div>
  );
}
