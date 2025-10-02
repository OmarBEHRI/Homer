export default function StatsSection() {
    return (
        <section className="bg-gray-50 py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                    <h2 className="text-4xl font-medium lg:text-5xl">Homer in Action</h2>
                    <p>Join thousands simplifying their lives with Homer.</p>
                </div>

                <div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0">
                    <div className="space-y-4">
                        <div className="text-5xl font-bold">+10K</div>
                        <p>Users</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-5xl font-bold">1M+</div>
                        <p>Tasks Managed</p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-5xl font-bold">50K</div>
                        <p>Resources Shared</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
