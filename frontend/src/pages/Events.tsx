import React, { useEffect, useState, useMemo } from 'react';
import { Search, ChevronDown, List, Grid } from 'lucide-react';
import type { EventDataProp } from '@/components/Interfaces/EventDataProp';
import type { FilterDropdownProp } from '@/components/Interfaces/FilterDropdownProp';
import { EventCard } from '@/components/Cards/EventCard';
import { isWithinRange } from '@/lib/utils';
import { RegisteredEventCard } from '@/components/Cards/RegisteredEventCard';
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';


// ============= Dummy Data =================
const categories = [
    'Arts & Science', 'Engineering', 'Agriculture', 'Pharmacy', 'Physiotherapy',
    'Allied Health Sciences', 'Hotel Management', 'Business'
];
const upcomingFilters = ['Upcoming', 'Today', 'Tomorrow', 'This Week', 'This Month', 'Past Event'];
const typeFilters = ['Free', 'Paid'];



// ============= Dropdown Component ===============
const FilterDropdown: React.FC<FilterDropdownProp> = ({ options, selectedValue, onSelect }) => (
    <div className="relative w-full">
        <select
            className="w-full appearance-none block bg-white border border-gray-300 py-3 pl-4 pr-10 text-base rounded-lg 
            focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            value={selectedValue}
            onChange={(e) => onSelect(e.target.value)}
        >
            {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </select>
        <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
    </div>
);

// ============= Main Component =================
const Events: React.FC = () => {
    const [search, setSearch] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('All Categories');
    const [upcomingFilter, setUpcomingFilter] = React.useState('Upcoming');
    const [typeFilter, setTypeFilter] = React.useState('All Types');
    const [viewType, setViewType] = React.useState<'grid' | 'list'>('grid');


    // Pagination
    const [currentPage, setCurrentPage] = React.useState(1);
    const eventsPerPage = 6;

    const [events, setEvents] = useState<EventDataProp[]>([]);

    // Debounce search input để giảm số lần filter
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when filters/search change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, categoryFilter, upcomingFilter, typeFilter]);




    // Fetch events from API
    useEffect(() => {
        const abortController = new AbortController();
        
        const fetchEvents = async () => {
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
            }
        };

        fetchEvents();
        
        return () => {
            abortController.abort();
        };
    }, []);


    // 🔍 FILTER EVENTS - Memoized để tránh tính toán lại mỗi lần render
    // Sử dụng debouncedSearch thay vì search để giảm số lần filter
    const filteredEvents = useMemo(() => {
        const now = new Date();
        const filtered = events.filter(event => {
            const dateObj = new Date(event.date);

            const matchesSearch =
                event.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                event.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                event.location.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchesCategory =
                categoryFilter === 'All Categories' || event.category === categoryFilter;

            const matchesType =
                typeFilter === 'All Types' ||
                (typeFilter === 'Free' && event.price === 0) ||
                (typeFilter === 'Paid' && event.price > 0);

            let matchesDate = false;
            if (upcomingFilter === 'Past Event') {
                matchesDate = dateObj < now;
            } else {
                matchesDate = isWithinRange(dateObj, upcomingFilter);
            }

            return matchesSearch && matchesCategory && matchesType && matchesDate;
        });

        // Sắp xếp theo date: upcoming events từ sớm đến muộn, past events từ muộn đến sớm
        return filtered.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (upcomingFilter === 'Past Event') {
                // Past events: sắp xếp từ muộn nhất đến sớm nhất
                return dateB - dateA;
            } else {
                // Upcoming events: sắp xếp từ sớm nhất đến muộn nhất
                return dateA - dateB;
            }
        });
    }, [events, debouncedSearch, categoryFilter, typeFilter, upcomingFilter]);

    // Pagination logic - Memoized
    const paginatedEvents = useMemo(() => {
        const indexOfLastEvent = currentPage * eventsPerPage;
        const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
        return filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    }, [filteredEvents, currentPage, eventsPerPage]);

    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 grow">

                {/* Search + View Toggle */}
                <div className="flex justify-between items-center mb-6">
                    <div className="grow mr-4">
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border border-gray-300 py-3 pl-10 pr-4 rounded-lg 
                                focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3 items-center">
                        <button
                            className={`p-2 rounded-lg ${viewType === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setViewType('grid')}
                        >
                            <Grid className="w-5 h-5" />
                        </button>

                        <button
                            className={`p-2 rounded-lg ${viewType === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setViewType('list')}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <FilterDropdown
                        label="Categories"
                        options={['All Categories', ...categories]}
                        selectedValue={categoryFilter}
                        onSelect={setCategoryFilter}
                    />
                    <FilterDropdown
                        label="Date"
                        options={upcomingFilters}
                        selectedValue={upcomingFilter}
                        onSelect={setUpcomingFilter}
                    />
                    <FilterDropdown
                        label="Types"
                        options={['All Types', ...typeFilters]}
                        selectedValue={typeFilter}
                        onSelect={setTypeFilter}
                    />
                </div>

                {/* Event List */}
                <section>
                    {filteredEvents.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No events found...</p>
                    ) : viewType === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedEvents.map(event => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paginatedEvents.map(event => (
                                <RegisteredEventCard key={event._id} event={event} showTicketCode={false} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Pagination */}
                <div className="mt-10 flex justify-center items-center space-x-2">

                    {/* Prev */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className={`px-4 py-2 rounded-lg border ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                            }`}
                    >
                        Prev
                    </button>

                    {/* Page numbers */}
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded-lg border ${currentPage === index + 1
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "hover:bg-gray-100"
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}

                    {/* Next */}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className={`px-4 py-2 rounded-lg border ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                            }`}
                    >
                        Next
                    </button>

                </div>

            </main>
        </div>
    );
};

export default Events;
