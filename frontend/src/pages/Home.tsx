import React, { useEffect, useMemo, useState } from 'react';
import {
    Search,
    Calendar,
    Users,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import type { QuickAccessCardProps } from '@/components/Interfaces/QuickAccessCardProps';
import type { EventDataProp } from '@/components/Interfaces/EventDataProp';
import EventCarouselCard from '@/components/Cards/EventCarouselCard';

// =====================
// Category Filter
// =====================
interface CategoryFilterProps {
    categories: string[];
    active: string;
    onChange: (cat: string) => void;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
    icon: Icon,
    title,
    description,
    buttonText,
    to,
}) => (
    <Link
        to={to}
        className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm transition hover:shadow-md hover:border-orange-400"
    >
        <Icon className="w-10 h-10 text-orange-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6 grow">{description}</p>
        <div className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            {buttonText}
        </div>
    </Link>
);

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    active,
    onChange,
}) => (
    <div className="flex space-x-2 p-2 bg-gray-50 border-y border-gray-200 overflow-x-auto">
        {categories.map((cat) => (
            <button
                key={cat}
                onClick={() => onChange(cat)}
                className={`px-4 py-1.5 text-sm rounded-lg whitespace-nowrap transition cursor-pointer
                ${cat === active
                        ? 'bg-gray-700 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
            >
                {cat}
            </button>
        ))}
    </div>
);

// =====================
// Home Page
// =====================
const Home: React.FC = () => {
    const categories: EventDataProp['category'][] = [
        'Arts & Science',
        'Engineering',
        'Agriculture',
        'Pharmacy',
        'Physiotherapy',
        'Allied Health Sciences',
        'Hotel Management',
        'Business',
    ];

    const [events, setEvents] = useState<EventDataProp[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] =
        useState<'All' | EventDataProp['category']>('All');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(false);

    // =====================
    // Fetch approved events
    // =====================
    useEffect(() => {
        const abortController = new AbortController();
        
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');

                const endpoint = token
                    ? API_ENDPOINTS.USER.ALL_EVENTS_APPROVED
                    : '/api/user/allEvents/everybodyApproved';

                const res = await apiClient.get(endpoint, {
                    signal: abortController.signal
                });
                
                if (!abortController.signal.aborted) {
                    setEvents(res.data.data || []);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError' && !abortController.signal.aborted) {
                    console.error('Error fetching events:', error);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchEvents();
        
        return () => {
            abortController.abort();
        };
    }, []);


    // =====================
    // Upcoming + Category filter
    // =====================
    const filteredEvents = useMemo(() => {
        const now = new Date();

        const upcomingEvents = events.filter(
            (e) => new Date(e.date) > now
        );

        if (activeCategory === 'All') return upcomingEvents;

        return upcomingEvents.filter(
            (e) => e.category === activeCategory
        );
    }, [events, activeCategory]);

    const currentEvent = filteredEvents[currentIndex];

    // =====================
    // Auto carousel (5s) with fade
    // =====================
    useEffect(() => {
        if (filteredEvents.length === 0) return;

        const interval = setInterval(() => {
            setFade(true);
            setTimeout(() => {
                setCurrentIndex(
                    (prev) => (prev + 1) % filteredEvents.length
                );
                setFade(false);
            }, 300);
        }, 5000);

        return () => clearInterval(interval);
    }, [filteredEvents]);

    const next = () => {
        setFade(true);
        setTimeout(() => {
            setCurrentIndex(
                (prev) => (prev + 1) % filteredEvents.length
            );
            setFade(false);
        }, 300);
    };

    const prev = () => {
        setFade(true);
        setTimeout(() => {
            setCurrentIndex((prev) =>
                prev === 0
                    ? filteredEvents.length - 1
                    : prev - 1
            );
            setFade(false);
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 grow">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Discover Campus Events
                </h1>

                {/* ================= Upcoming Events ================= */}
                <section className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Upcoming Events
                        </h2>
                        <Link
                            to="/events"
                            className="text-sm font-medium text-orange-600 hover:text-orange-800"
                        >
                            View All Events
                        </Link>
                    </div>

                    <CategoryFilter
                        categories={['All', ...categories]}
                        active={activeCategory}
                        onChange={(cat) => {
                            setActiveCategory(cat as any);
                            setCurrentIndex(0);
                        }}

                    />

                    {/* Carousel */}
                    <div className="relative mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden min-h-80">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <Calendar className="w-12 h-12 text-gray-400" />
                            </div>
                        ) : !currentEvent ? (
                            <div className="flex items-center justify-center p-12 text-gray-500">
                                No upcoming events
                            </div>
                        ) : (
                            <div
                                className={`transition-opacity duration-500 ease-in-out ${fade ? 'opacity-0' : 'opacity-100'
                                    }`}
                            >
                                <EventCarouselCard event={currentEvent} />
                            </div>
                        )}

                        {filteredEvents.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={next}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </section>

                {/* ================= Quick Access ================= */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Quick Access
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickAccessCard
                            icon={Calendar}
                            title="Event Calendar"
                            description="View all upcoming events in a calendar format."
                            buttonText="Open Calendar"
                            to="/calendar"
                        />
                        <QuickAccessCard
                            icon={Users}
                            title="My Events"
                            description="View your registered events, past events, and events you created."
                            buttonText="View My Events"
                            to="/myevent"
                        />
                        <QuickAccessCard
                            icon={Search}
                            title="Find Events"
                            description="Search for events by category, date, or keyword"
                            buttonText="Search Events"
                            to="/events"
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
