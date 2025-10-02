import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Check, DollarSign, Share2 } from 'lucide-react'
import { ReactNode } from 'react'

export default function Features() {
    return (
        <section className="bg-gray-50 py-16 pt-32 md:py-32">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Built to cover your needs</h2>
                    <p className="mt-4">Libero sapiente aliquam quibusdam aspernatur, praesentium iusto repellendus.</p>
                </div>
                <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
                    <Card className="group bg-white/60 shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Check
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Effortless Task Management</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm">Simple projects and task manager to get things done fast without confusion or excessive planning.</p>
                        </CardContent>
                    </Card>

                    <Card className="group bg-white/60 shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <DollarSign
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Smart Budget Tracking</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Manage your monthly budget by splitting into classified expenses, savings, and investments.</p>
                        </CardContent>
                    </Card>

                    <Card className="group bg-white/60 shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Share2
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Easy Resource Sharing</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Store and share valuable web resources with descriptions in categories like Wealth, Knowledge, and Recreation.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
        />

        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)
