import { Layout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui';
import { BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';

export const HomePage = () => {
  const stats = [
    { icon: BookOpen, label: 'Courses', value: '24', color: 'text-primary' },
    { icon: Users, label: 'Students', value: '1,234', color: 'text-secondary' },
    { icon: Calendar, label: 'Events', value: '12', color: 'text-primary' },
    { icon: TrendingUp, label: 'Growth', value: '+23%', color: 'text-secondary' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        
      </div>
    </Layout>
  );
};
