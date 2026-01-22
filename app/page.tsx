"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ time: 0, content: 0, satisfaction: 0 });

  useEffect(() => {
    setIsVisible(true);

    // Animated counters
    const animateCounter = (target: number, key: keyof typeof stats, duration = 2000) => {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setStats(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, 16);
    };

    setTimeout(() => {
      animateCounter(5, 'time');
      animateCounter(10000, 'content');
      animateCounter(99, 'satisfaction');
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200/5 to-blue-300/5 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-500"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex justify-between items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <Link href="/" className="group flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                CMO AI
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 relative group">
                How it Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <Link
                href="/login"
                className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className={`text-center max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold mb-8 border border-indigo-200/50 shadow-lg ${isVisible ? 'animate-in slide-in-from-top-4 duration-700' : ''}`}>
              <span className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-2 animate-pulse"></span>
              ✨ AI-Powered Content Creation Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Create Stunning Social Media
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Content in Minutes
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Describe your business, and let our AI generate ready-to-post content for Instagram,
              TikTok, LinkedIn, and more. From captions to hashtags, we've got you covered.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                href="/register"
                className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 inline-flex items-center justify-center"
              >
                <span>Start Creating Content Free</span>
                <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 bg-white shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center justify-center">
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3-3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Watch 2-Min Demo</span>
              </button>
            </div>

            {/* Trust indicators */}
            <div className={`flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free forever plan available
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything you need to succeed on social media
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our AI-powered platform handles the heavy lifting so you can focus on growing your business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <div className="group bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast Creation</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Generate complete social media campaigns in under 5 minutes with our advanced AI technology.
                </p>
                <div className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  Learn more →
                </div>
              </div>

              <div className="group bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Multi-Platform Support</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Posts, stories, reels, banners, and more. All optimized for maximum engagement across platforms.
                </p>
                <div className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  Learn more →
                </div>
              </div>

              <div className="group bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart AI Understanding</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Advanced AI that understands your brand voice and creates content that resonates with your audience.
                </p>
                <div className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  Learn more →
                </div>
              </div>

              <div className="group bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Insights</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Track performance, engagement rates, and optimize your content strategy with detailed analytics.
                </p>
                <div className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  Learn more →
                </div>
              </div>

              <div className="group bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Automated Scheduling</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Schedule posts automatically across all your social media platforms for optimal engagement.
                </p>
                <div className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  Learn more →
                </div>
              </div>

              <div className="group bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Security</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Bank-level security with end-to-end encryption, ensuring your data and content are always protected.
                </p>
                <div className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  Learn more →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                How It Works - Simple as 1, 2, 3
              </h2>
              <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
                Get started in minutes and see results immediately
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center group">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Describe Your Business</h3>
                <p className="text-indigo-100 leading-relaxed">
                  Tell us about your products, target audience, and brand personality. Our AI learns your unique voice.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Generates Content</h3>
                <p className="text-indigo-100 leading-relaxed">
                  Watch as our AI creates engaging captions, hashtags, and content strategies tailored to your brand.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Post & Grow</h3>
                <p className="text-indigo-100 leading-relaxed">
                  Publish directly to your social media platforms and watch your engagement soar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-purple-900/20"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Trusted by Thousands of Businesses
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Join the growing community of successful businesses using CMO AI
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="text-6xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text mb-4 transition-all duration-300 group-hover:scale-110">
                  {stats.time || 5}
                </div>
                <div className="text-indigo-300 text-lg font-medium mb-2">Minutes</div>
                <div className="text-gray-400">Average content creation time</div>
              </div>

              <div className="text-center group">
                <div className="text-6xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4 transition-all duration-300 group-hover:scale-110">
                  {(stats.content / 1000).toFixed(0) || 10}K+
                </div>
                <div className="text-purple-300 text-lg font-medium mb-2">Content Pieces</div>
                <div className="text-gray-400">Generated and published</div>
              </div>

              <div className="text-center group">
                <div className="text-6xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text mb-4 transition-all duration-300 group-hover:scale-110">
                  {stats.satisfaction || 99}%
                </div>
                <div className="text-pink-300 text-lg font-medium mb-2">Satisfaction</div>
                <div className="text-gray-400">Customer satisfaction rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Social Media Presence?
              </h2>
              <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using CMO AI to create engaging content that drives results.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 inline-flex items-center justify-center"
                >
                  Start Free Trial
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">CMO AI</span>
              </Link>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Revolutionizing social media content creation with AI-powered tools that help businesses grow their online presence.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 CMO AI. All rights reserved. Built with ❤️ for social media creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}