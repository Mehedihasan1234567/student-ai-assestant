"use client"

import { StudyMateLogo } from "@/components/icons/studymate-logo"
import { StudyMateLogoSimple } from "@/components/icons/studymate-logo-simple"
import { StudyMateFavicon } from "@/components/icons/studymate-favicon"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LogoShowcasePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          StudyMate Logo Showcase
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          New AI-powered logo designs matching the purple theme
        </p>
      </div>

      {/* Main Logo */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-800 dark:text-purple-200">Main Logo (Animated)</CardTitle>
          <CardDescription>Full-featured logo with animations and effects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center space-y-4">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border">
                <StudyMateLogo size={80} />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Light Background</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-neutral-900 p-6 rounded-lg border">
                <StudyMateLogo size={80} />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Dark Background</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-lg border">
                <StudyMateLogo size={80} />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Gradient Background</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Logo */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-800 dark:text-purple-200">Simple Logo (Recommended)</CardTitle>
          <CardDescription>Clean, modern design perfect for sidebars and headers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            <div className="text-center space-y-3">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border">
                <StudyMateLogoSimple size={48} />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">48px</p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border">
                <StudyMateLogoSimple size={36} />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">36px (Sidebar)</p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border">
                <StudyMateLogoSimple size={24} />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">24px</p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border">
                <StudyMateLogoSimple size={16} />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">16px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favicon */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-800 dark:text-purple-200">Favicon</CardTitle>
          <CardDescription>Optimized for browser tabs and small displays</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            <div className="text-center space-y-3">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border">
                <StudyMateFavicon size={32} />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">32px</p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border">
                <StudyMateFavicon size={24} />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">24px</p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border">
                <StudyMateFavicon size={16} />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">16px (Browser Tab)</p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border">
                <StudyMateFavicon size={12} />
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">12px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo with Text Examples */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-800 dark:text-purple-200">Logo with Text Combinations</CardTitle>
          <CardDescription>How the logo looks with different text layouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Horizontal Layout */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
              <StudyMateLogoSimple size={40} />
              <div>
                <h3 className="font-bold text-xl text-neutral-900 dark:text-neutral-100">StudyMate</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">🤖 AI Study Assistant</p>
              </div>
            </div>

            {/* Vertical Layout */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
              <StudyMateLogoSimple size={60} className="mx-auto mb-3" />
              <h3 className="font-bold text-2xl text-neutral-900 dark:text-neutral-100 mb-1">StudyMate</h3>
              <p className="text-purple-600 dark:text-purple-400">🤖 AI Study Assistant</p>
            </div>

            {/* Compact Layout */}
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-800 rounded-lg border inline-flex">
              <StudyMateLogoSimple size={24} />
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">StudyMate</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Features */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-800 dark:text-purple-200">Design Features</CardTitle>
          <CardDescription>What makes this logo perfect for StudyMate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Visual Elements</h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Purple gradient matching your app theme
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Book icon representing study and learning
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  AI neural network symbol for intelligence
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Subtle animations and glow effects
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Technical Features</h4>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  SVG format for crisp scaling
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Dark mode compatible
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Multiple size variants
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Optimized for web performance
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}