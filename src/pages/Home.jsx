import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  Lock,
  Check,
  Crown,
  Smartphone,
  BarChart3
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure File Sharing",
      description: "End-to-end encryption ensures your files are always protected during transfer and storage."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "High-speed uploads and downloads with our optimized global CDN infrastructure."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share files with your team, set permissions, and track access with detailed analytics."
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Access your files from anywhere in the world with our reliable cloud infrastructure."
    },
    {
      icon: Lock,
      title: "Password Protection",
      description: "Add an extra layer of security with password-protected links and expiration dates."
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Upload and manage files on the go with our responsive mobile interface."
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for personal use",
      features: [
        "10GB storage",
        "Basic file sharing",
        "500KB/s download speed",
        "Max 5GB file size",
        "Ads supported"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "ShareZone Pro",
      price: "$3.75",
      period: "per month",
      yearlyPrice: "$20/year",
      description: "For individuals and professionals",
      features: [
        "1TB storage",
        "No ads",
        "1GB/s download speed",
        "Direct links",
        "Password protection",
        "Custom upload pages"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "ShareZone Business",
      price: "$10",
      period: "per user/month",
      yearlyPrice: "$100/year per user",
      description: "For teams and organizations",
      features: [
        "10TB storage per user",
        "Everything in Pro",
        "Custom branding",
        "Admin controls",
        "Activity logs",
        "Priority support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const stats = [
    { label: "Files Shared", value: "10M+", icon: FileText },
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Countries", value: "120+", icon: Globe },
    { label: "Uptime", value: "99.9%", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen pt-16"> {/* Added pt-16 for fixed header */}
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8"> {/* Adjusted pt */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">ShareZone: Secure File Sharing</span>
              <br />
              Made Simple & Fast
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Upload, share, and manage your files with enterprise-grade security. 
              Perfect for individuals, teams, and businesses of all sizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-bg hover:opacity-90 text-lg px-8 py-3">
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <Link to="#features">Learn More</Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16"
          >
            <div className="relative">
              <img  
                className="mx-auto rounded-2xl shadow-2xl max-w-4xl w-full"
                alt="ShareZone dashboard interface showing file management and collaboration"
               src="https://images.unsplash.com/photo-1667984390553-7f439e6ae401" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-70 rounded-2xl"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="stats-card bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-blue-500/30 transition-all">
                  <stat.icon className="w-8 h-8 mx-auto mb-4 text-blue-400" />
                  <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to share files securely and efficiently with ShareZone
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-white/10 h-full hover:border-blue-500/50 transition-all backdrop-blur-sm">
                  <CardHeader>
                    <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Simple Pricing for ShareZone</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the perfect plan for your needs. Upgrade or downgrade at any time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`pricing-card bg-card/50 backdrop-blur-sm rounded-2xl p-8 relative border border-white/10 ${
                  plan.popular ? 'featured-plan pulse-glow border-blue-500/50' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="gradient-bg px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Crown className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                  {plan.yearlyPrice && (
                    <p className="text-sm text-green-400">{plan.yearlyPrice} (Save 33%)</p>
                  )}
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${plan.popular ? 'gradient-bg' : 'border border-gray-600 hover:border-blue-500'}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl p-12 border border-white/10 backdrop-blur-sm"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get started with ShareZone?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who trust ShareZone for their file sharing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-bg hover:opacity-90 text-lg px-8 py-3">
                <Link to="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;