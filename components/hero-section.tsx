"use client";

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'
import Image from 'next/image'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from './header'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: "spring" as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="relative overflow-hidden bg-gray-50">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-75 contain-strict lg:block">
                    <div className="absolute left-0 top-0 h-80 w-80 -translate-y-20 -rotate-12 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6)_0%,rgba(229,231,235,0)_70%)]" />
                    <div className="absolute right-0 top-10 h-96 w-96 translate-x-12 rotate-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.5)_0%,rgba(229,231,235,0)_70%)]" />
                    <div className="absolute bottom-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 translate-y-1/3 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55)_0%,rgba(229,231,235,0)_80%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: "spring" as const,
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32">
                            <Image
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="hidden size-full dark:block"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>

                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full bg-gradient-to-br from-gray-50 via-white to-gray-100"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="#link"
                                        className="bg-white/60 group mx-auto flex w-fit items-center gap-4 rounded-full border border-white/70 p-1 pl-4 shadow-md shadow-zinc-950/5 backdrop-blur transition-colors duration-300">
                                        <span className="text-foreground text-sm">Your All-in-One Productivity Hub</span>
                                        <span className="block h-4 w-0.5 border-l border-white/70 bg-white/70"></span>

                                        <div className="bg-white/70 group-hover:bg-white/90 size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </AnimatedGroup>

                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                    Homer: Simplify Tasks, Budgets, and More
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                    Manage projects and tasks effortlessly, track your budget with ease, chat with friends, store and share resources, and customize your dashboard—all in one simple app.
                                </TextEffect>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        item: {
                                            hidden: {
                                                opacity: 0,
                                                filter: 'blur(12px)',
                                                y: 12,
                                            },
                                            visible: {
                                                opacity: 1,
                                                filter: 'blur(0px)',
                                                y: 0,
                                                transition: {
                                                    type: "spring" as const,
                                                    bounce: 0.3,
                                                    duration: 1.5,
                                                },
                                            },
                                        },
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="rounded-[calc(var(--radius-xl)+0.125rem)] border border-white/70 bg-white/60 p-0.5 backdrop-blur">
                                        <Authenticated>
                                            <Button
                                                asChild
                                                size="lg"
                                                className="rounded-xl bg-[#f0e3c8] px-5 text-base text-neutral-800 hover:bg-[#ead8b8]">
                                                <Link href="/dashboard">
                                                    <span className="text-nowrap">Go to Dashboard</span>
                                                </Link>
                                            </Button>
                                        </Authenticated>
                                        <Unauthenticated>
                                            <Button
                                                asChild
                                                size="lg"
                                                className="rounded-xl bg-[#f0e3c8] px-5 text-base text-neutral-800 hover:bg-[#ead8b8]">
                                                <Link href="/sign-in">
                                                    <span className="text-nowrap">Get Started</span>
                                                </Link>
                                            </Button>
                                        </Unauthenticated>
                                        <AuthLoading>
                                            <Button
                                                size="lg"
                                                disabled
                                                className="rounded-xl bg-[#f0e3c8] px-5 text-base text-neutral-800">
                                                Loading...
                                            </Button>
                                        </AuthLoading>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5 text-neutral-800 hover:bg-white/50">
                                        <Link href="#features">
                                            <span className="text-nowrap">Explore Features</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
