import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function fetchBusinesses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #4f46e5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Chargement...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '20px',
          color: '#991b1b'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            ❌ Erreur Supabase
          </h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          🎯 Admin Dashboard
        </h1>
        <p style={{ opacity: 0.9, fontSize: '16px' }}>
          Gestion de tous les commerces LocalBoost
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
            Total Commerces
          </p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
            {businesses.length}
          </p>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
            Plans PRO
          </p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4f46e5' }}>
            {businesses.filter(b => b.plan === 'pro').length}
          </p>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
            Plans BASIC
          </p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>
            {businesses.filter(b => b.plan === 'basic').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                Commerce
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                Email
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                Ville
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                Plan
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                Prix
              </th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz, idx) => (
              <tr 
                key={biz.id}
                style={{
                  borderTop: '1px solid #e2e8f0',
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <td style={{ padding: '16px', fontWeight: '500', color: '#1e293b' }}>
                  {biz.name || 'Sans nom'}
                </td>
                <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                  {biz.email || 'N/A'}
                </td>
                <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                  {biz.city || 'N/A'}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: biz.plan === 'pro' ? '#e0e7ff' : '#dbeafe',
                    color: biz.plan === 'pro' ? '#4f46e5' : '#2563eb'
                  }}>
                    {biz.plan?.toUpperCase() || 'N/A'}
                  </span>
                </td>
                <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>
                  {biz.price ? `${biz.price}€/mois` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {businesses.length === 0 && (
          <p style={{
            textAlign: 'center',
            padding: '40px',
            color: '#94a3b8',
            fontSize: '16px'
          }}>
            Aucun commerce enregistré
          </p>
        )}
      </div>
    </div>
  );
}
