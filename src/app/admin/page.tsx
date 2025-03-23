'use client';

import React from 'react';
import { RequireAdmin } from '@/lib/auth/RequireAuth';
import { useAuth } from '@/lib/auth/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <RequireAdmin>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        {user && (
          <div className="bg-white p-4 shadow rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}</h2>
            <p className="text-gray-600">Admin Email: {user.email}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard 
            title="Products" 
            count="25" 
            link="/admin/products" 
            icon="📦" 
          />
          <DashboardCard 
            title="Orders" 
            count="12" 
            link="/admin/orders" 
            icon="🛒" 
          />
          <DashboardCard 
            title="Users" 
            count="87" 
            link="/admin/users" 
            icon="👥" 
          />
          <DashboardCard 
            title="Designs" 
            count="35" 
            link="/admin/designs" 
            icon="🎨" 
          />
          <DashboardCard 
            title="Inventory" 
            count="152" 
            link="/admin/inventory" 
            icon="📊" 
          />
          <DashboardCard 
            title="Settings" 
            count="" 
            link="/admin/settings" 
            icon="⚙️" 
          />
        </div>
      </div>
    </RequireAdmin>
  );
}

interface DashboardCardProps {
  title: string;
  count: string;
  link: string;
  icon: string;
}

function DashboardCard({ title, count, link, icon }: DashboardCardProps) {
  return (
    <a href={link} className="block">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <span className="text-3xl">{icon}</span>
        </div>
        {count && (
          <p className="text-2xl font-bold text-blue-600">{count}</p>
        )}
        <div className="mt-4 text-blue-500 font-medium">Manage →</div>
      </div>
    </a>
  );
}