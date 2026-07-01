'use client';

import { motion } from 'framer-motion';
import {
    Brush,
    Camera,
    Code,
    Crown,
    FileText,
    ImageIcon,
    Layers,
    LayoutGrid,
    Palette,
    Search,
    Sparkles,
    Star,
    Video,
    Type,
    CuboidIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
const apps = [
    {
        name: 'PixelMaster',
        icon: <ImageIcon className="text-violet-500" />,
        description: 'Advanced image editing and composition',
        category: 'Creative',
        recent: true,
        new: false,
        progress: 100,
    },
    {
        name: 'VectorPro',
        icon: <Brush className="text-orange-500" />,
        description: 'Professional vector graphics creation',
        category: 'Creative',
        recent: true,
        new: false,
        progress: 100,
    },
    {
        name: 'VideoStudio',
        icon: <Video className="text-pink-500" />,
        description: 'Cinematic video editing and production',
        category: 'Video',
        recent: true,
        new: false,
        progress: 100,
    },
    {
        name: 'MotionFX',
        icon: <Sparkles className="text-blue-500" />,
        description: 'Stunning visual effects and animations',
        category: 'Video',
        recent: false,
        new: false,
        progress: 100,
    },
    {
        name: 'PageCraft',
        icon: <Layers className="text-red-500" />,
        description: 'Professional page design and layout',
        category: 'Creative',
        recent: false,
        new: false,
        progress: 100,
    },
    {
        name: 'UXFlow',
        icon: <LayoutGrid className="text-fuchsia-500" />,
        description: 'Intuitive user experience design',
        category: 'Design',
        recent: false,
        new: true,
        progress: 85,
    },
    {
        name: 'PhotoLab',
        icon: <Camera className="text-teal-500" />,
        description: 'Advanced photo editing and organization',
        category: 'Photography',
        recent: false,
        new: false,
        progress: 100,
    },
    {
        name: 'DocMaster',
        icon: <FileText className="text-red-600" />,
        description: 'Document editing and management',
        category: 'Document',
        recent: false,
        new: false,
        progress: 100,
    },
    {
        name: 'WebCanvas',
        icon: <Code className="text-emerald-500" />,
        description: 'Web design and development',
        category: 'Web',
        recent: false,
        new: true,
        progress: 70,
    },
    {
        name: '3DStudio',
        icon: <CuboidIcon className="text-indigo-500" />,
        description: '3D modeling and rendering',
        category: '3D',
        recent: false,
        new: true,
        progress: 60,
    },
    {
        name: 'FontForge',
        icon: <Type className="text-amber-500" />,
        description: 'Typography and font creation',
        category: 'Typography',
        recent: false,
        new: false,
        progress: 100,
    },
    {
        name: 'ColorPalette',
        icon: <Palette className="text-purple-500" />,
        description: 'Color scheme creation and management',
        category: 'Design',
        recent: false,
        new: false,
        progress: 100,
    },
];

export default function BillingPage() {
    return (
        <main className="overflow-hidden">
            <section>
                <div className="overflow-hidden rounded bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Learn & Grow</h2>
                            <p className="max-w-[600px] text-white/80">
                                Expand your creative skills with tutorials, courses, and resources.
                            </p>
                        </div>
                        <Button className="w-fit rounded bg-white text-emerald-700 hover:bg-white/90">
                            <Crown className="mr-2 h-4 w-4" />
                            Add Agent
                        </Button>
                    </div>
                </div>
            </section>
            <div className="space-y-8 p-2 mt-4">
                <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded">
                        All Categories
                    </Button>
                    <Button variant="outline" className="rounded">
                        Creative
                    </Button>
                    <Button variant="outline" className="rounded">
                        Video
                    </Button>
                    <Button variant="outline" className="rounded">
                        Web
                    </Button>
                    <Button variant="outline" className="rounded">
                        3D
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search apps..."
                            className="w-full rounded pl-9 md:w-[200px]"
                        />
                    </div>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">All Apps</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {apps.map(app => (
                            <motion.div key={app.name} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                                <Card className="overflow-hidden rounded border hover:border-primary/50 transition-all duration-300">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                                {app.icon}
                                            </div>
                                            <Badge variant="outline" className="rounded-xl">
                                                {app.category}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <CardTitle className="text-lg">{app.name}</CardTitle>
                                        <CardDescription>{app.description}</CardDescription>
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        <Button variant="secondary" className="flex-1 rounded-2xl">
                                            {app.progress < 100 ? 'Install' : 'Open'}
                                        </Button>
                                        <Button variant="outline" size="icon" className="rounded-2xl">
                                            <Star className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
