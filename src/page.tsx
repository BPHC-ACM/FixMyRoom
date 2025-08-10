"use client"

import React, { useMemo } from "react";
import jsPDF from "jspdf";
import { useState, useEffect } from "react"
import autoTable from "jspdf-autotable";
import { supabase } from "./supabaseClient"
import { exportRequestsPdf } from "./lib/reports"
import {
    Building,
    User,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    PenToolIcon as Tool,
    
    MessageSquare,
    Zap,
    Droplet,
    Hammer,
    ChevronDown,
    ChevronUp,
    RefreshCw, 
    CheckCheck,
    Calendar,
    Printer,
    Trash2,
    RotateCcw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./components/card"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Input } from "./components/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/select"

import { Avatar, AvatarFallback, AvatarImage } from "./components/avatar"

// Types
type MaintenanceRequest = {
    id: string
    name: string
    studentId: string
    email: string
    phone: string
    building: string
    roomNo: string
    category: string
    problem: string
    priority: "low" | "medium" | "high"
    visitTime: "morning" | "afternoon" | "evening" | "any"
    status: "pending" | "in-progress" | "completed"
    created_at: string
    assignedTo?: string
    comments: {
        id: string
        text: string
        from: "admin" | "user"
        timestamp: string
    }[]
    hasImage: boolean
    isDeleted?: boolean
}

type StaffMember = {
    id: string
    name: string
    role: string
    avatar: string
}




const maintenanceStaff: StaffMember[] = [
    { id: "staff1", name: "Plumber", role: "Plumber", avatar: "" },
    { id: "staff2", name: "Carpenter", role: "Carpenter", avatar: "" },
    { id: "staff3", name: "Electrician", role: "Electrician", avatar: "" },
    { id: "staff4", name: "General Maintenance", role: "General Maintenance", avatar: "" },
]

export default function AdminDashboard() {
    // State
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);

useEffect(() => {
  supabase
    .from('maintenance_requests')
    .select('*')
    .then(({ data, error }) => {
      if (error) console.error(error);
      else setRequests(data || []);
    });
}, []);
const [adminName, setAdminName] = useState<string | null>(null);
const [user, setUser] = useState<{ email: string } | null>(null);

useEffect(() => {
        // Fetch current user from Supabase auth
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (!error && data?.user) {
                setUser({ email: data.user.email ?? "" });
            }
        };
        fetchUser();
    }, []);

useEffect(() => {
        const fetchAdminName = async () => {
            if (!user?.email) return;
            const { data, error } = await supabase
                .from('admins') // table name
                .select('name')
                .eq('email_id', user.email) // your actual email column
                .single();

            if (!error && data) {
                setAdminName(data.name);
            }
        };

        if (user?.email) {
            fetchAdminName();
        }
    }, [user?.email]);


    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [buildingFilter, setBuildingFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [priorityFilter, setPriorityFilter] = useState<string>("all")
    const [newComment, setNewComment] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [viewMode, setViewMode] = useState<"active" | "past">("active")

    const isPast = (r: MaintenanceRequest) => r.isDeleted === true || r.status === "completed"
    
    // Filter and sort requests
    const filteredRequests = useMemo(() => {
    return requests
    .filter((request) => {

        const matchesView = viewMode === "active" ? !isPast(request) : isPast(request)

      const search = searchQuery.toLowerCase()
  
      const matchesSearch =
        (request.name?.toLowerCase() ?? "").includes(search) ||
        (request.studentId?.toLowerCase() ?? "").includes(search) ||
        (String(request.id) ?? "").includes(search)
  
      // Status filter (skip when viewing past and isDeleted; still allow completed match)
        const matchesStatus =
          statusFilter === "all" ||
          request.status === statusFilter ||
          (viewMode === "past" && request.isDeleted === true && statusFilter === "all")
      const matchesBuilding = buildingFilter === "all" || request.building === buildingFilter
      const matchesCategory = categoryFilter === "all" || request.category === categoryFilter
      const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter
  
     return matchesView && matchesSearch && matchesStatus && matchesBuilding && matchesCategory && matchesPriority
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at ?? "").getTime()
      const dateB = new Date(b.created_at ?? "").getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })}, [requests, viewMode, searchQuery, statusFilter, buildingFilter, categoryFilter, priorityFilter, sortOrder])
  
    // Statistics
    const totalRequests = requests.length
    const pendingRequests = requests.filter((r) => r.status === "pending" && !r.isDeleted).length
    const inProgressRequests = requests.filter((r) => r.status === "in-progress" && !r.isDeleted).length
    const completedRequests = requests.filter((r) => r.status === "completed" && !r.isDeleted).length

    // Handle status update
    const updateStatus = async (id: string, status: "pending" | "in-progress" | "completed") => {
        setIsLoading(true);
    
        const { error } = await supabase
            .from("maintenance_requests")
            .update({ status })
            .eq("id", id);
    
        if (error) {
            console.error("Status update failed:", error);
        } else {
            const updatedRequests = requests.map((request) =>
                request.id === id ? { ...request, status } : request
            );
            setRequests(updatedRequests);
    
            if (selectedRequest?.id === id) {
                setSelectedRequest({ ...selectedRequest, status });
            }
        }
    
        setIsLoading(false);
    };
    
    

const handlePrint = (request: MaintenanceRequest) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Maintenance Request Details", 20, 20);

  doc.setFontSize(12);
  doc.text(`ID: ${request.id}`, 20, 40);
  doc.text(`Name: ${request.name}`, 20, 50);
  doc.text(`Phone: ${request.phone}`, 20, 60);
  doc.text(`Category: ${request.category}`, 20, 70);
  doc.text("Description:", 20, 80);
  doc.text(doc.splitTextToSize(request.problem ?? "N/A", 170), 20, 90);

  doc.save(`${request.id}.pdf`);
};


    // Handle staff assignment
    const assignStaff = (requestId: string, staffId: string) => {
        const staffMember = maintenanceStaff.find((staff) => staff.id === staffId)

        if (!staffMember) return

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, assignedTo: staffMember.name } : r)),
            )

            setSelectedRequest((prev) => (prev && prev.id === requestId ? { ...prev, assignedTo: staffMember.name } : prev))

            setIsLoading(false)
        }, 400)
    }


        // Soft delete
    const softDelete = (id: string) => {
        if (!confirm("Soft delete this request? You can restore it from Past requests.")) return
        setIsLoading(true)
        setTimeout(() => {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, isDeleted: true } : r)))
        setSelectedRequest((prev) => (prev && prev.id === id ? { ...prev, isDeleted: true } : prev))
        setIsLoading(false)
        }, 300)
    }

    // Reopen request (from completed or deleted -> pending and active)
    const reopenRequest = (id: string) => {
        setIsLoading(true)
        setTimeout(() => {
        setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "pending", isDeleted: false } : r)),
        )
        setSelectedRequest((prev) => (prev && prev.id === id ? { ...prev, status: "pending", isDeleted: false } : prev))
        setViewMode("active")
        setIsLoading(false)
        }, 300)
    }
   

    // Reset filters
    const resetFilters = () => {
        setSearchQuery("")
        setStatusFilter("all")
        setBuildingFilter("all")
        setCategoryFilter("all")
        setPriorityFilter("all")
    }

    // Helper functions
    const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date ve";

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    };


    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "electricity":
                return <Zap className="w-5 h-5 text-yellow-500" />
            case "plumbing":
                return <Droplet className="w-5 h-5 text-blue-500" />
            case "carpentry":
                return <Hammer className="w-5 h-5 text-amber-600" />
            default:
                return <Tool className="w-5 h-5 text-gray-500" />
        }
    }

    const getCategoryName = (category: string) => {
        const categories: Record<string, string> = {
            electricity: "Electricity",
            plumbing: "Plumbing",
            carpentry: "Carpentry",
        }
        return categories[category] || category
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "high":
                return <Badge variant="destructive">High</Badge>
            case "medium":
                return (
                    <Badge variant="default" className="bg-amber-500">
                        Medium
                    </Badge>
                )
            case "low":
                return (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                        Low
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }
    


    
    
    const handlePrintAll = (filteredRequests: MaintenanceRequest[]) => {
      const doc = new jsPDF();
    
      doc.setFontSize(16);
      doc.text("Filtered Maintenance Requests", 14, 20);
    
      autoTable(doc, {
        startY: 30,
        head: [["Name", "Phone", "Building", "Room", "Category", "Priority", "Description"]],
        body: filteredRequests.map((req) => [
          
          req.name,
          req.phone,
          req.building,
          req.roomNo,
          req.category,
          req.priority,
          req.problem,
        ]),
        styles: {
          cellPadding: 2,
          fontSize: 8,
        },
      });
    
      doc.save("filtered_requests.pdf");
    };
    
    
    const getStatusBadge = (request: MaintenanceRequest) => {
    if (request.isDeleted) {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          Deleted
        </Badge>
      )
    }
    switch (request.status) {
            case "pending":
                return (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                        Pending
                    </Badge>
                )
            case "in-progress":
                return (
                    <Badge variant="default" className="bg-blue-500">
                        In Progress
                    </Badge>
                )
            case "completed":
                return (
                    <Badge variant="default" className="bg-green-600">
                        Completed
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }
    
      
    const getHostelName = (buildingCode: string) => {
        const hostels: Record<string, string> = {
            "Viswakarma Bhavan": "Viswakarma Bhavan",
            "Valmiki Bhavan": "Valmiki Bhavan",
            "Gautham Bhavan": "Gautham Bhavan",
            "Gandhi Bhavan": "Gandhi Bhavan",
            "Budh Bhavan": "Budh Bhavan",
            "Malaivya Bhavan": "Malaivya Bhavan",
            "Meera Bhavan": "Meera Bhavan",
            "Shankar Bhavan": "Shankar Bhavan",
            "Ram Bhavan": "Ram Bhavan",
            "Krishna Bhavan": "Krishna Bhavan"
        }
        return hostels[buildingCode] || buildingCode
    }

    const handleExportPdf = async () => {
    // Map MaintenanceRequest[] to RequestForReport[]
    const requestsForReport = filteredRequests.map((r) => ({
      ...r,
      dateSubmitted: r.created_at,
    }));
    await exportRequestsPdf(requestsForReport, {
      title: `Maintenance Report — ${viewMode === "active" ? "Active" : "Past"} Requests`,
    })
  }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Tool className="w-8 h-8" />
                            <div>
                                <h1 className="text-2xl font-bold">Campus Maintenance Portal</h1>
                                <p className="text-blue-100">Admin Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-2">
                                <span>{adminName}</span>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder.svg" alt="Admin" />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Requests</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{totalRequests}</h3>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <MessageSquare className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Pending</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{pendingRequests}</h3>
                                </div>
                                <div className="p-3 bg-amber-100 rounded-full">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{inProgressRequests}</h3>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <RefreshCw className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Completed</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{completedRequests}</h3>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Requests List */}
                    <div className="lg:col-span-1">
                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Maintenance Requests</CardTitle>

                  {/* View Switcher */}
                  <div className="inline-flex rounded-md border overflow-hidden">
                    <button
                      aria-label="Show Active Requests"
                      className={`px-3 py-1.5 text-sm ${
                        viewMode === "active" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
                      }`}
                      onClick={() => setViewMode("active")}
                    >
                      Active
                    </button>
                    <button
                      aria-label="Show Past Requests"
                      className={`px-3 py-1.5 text-sm border-l ${
                        viewMode === "past" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
                      }`}
                      onClick={() => setViewMode("past")}
                    >
                      Past
                    </button>
                  </div>
                </div>

                {/* Sort control */}
                <div className="mt-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                                        className="h-8"
                                    >
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Search and Filters */}
                                <div className="mb-4 space-y-3">
  <div className="flex items-center gap-2 px-3 py-2 border rounded-md shadow-sm">
    <Search className="text-gray-400 h-4 w-4" />
    <input
      type="text"
      placeholder="Search by name, ID or request number..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full outline-none bg-transparent"
    />
  </div>


                                

                                

                                    <div className="grid grid-cols-2 gap-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-blue-100/50 backdrop-blur-md shadow-lg">
                                        <SelectItem className="hover:bg-blue-200/50" value="all">All Statuses</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="pending">Pending</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="in-progress">In Progress</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Hostels" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-blue-100/50 backdrop-blur-md shadow-lg">
                                        <SelectItem className="hover:bg-blue-200/50" value="all">Hostels</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Viswakarma Bhavan">Viswakarma Bhavan</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Valmiki Bhavan">Valmiki Bhavan</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Gautham Bhavan">Gautham Bhavan</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Gandhi Bhavan">Gandhi Bhavan</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Budh Bhavan">Budh Bhavan</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Malaivya Bhavan">Malaivya Bhavan</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Meera Bhavan">Meera Bhavan</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Shankar Bhavan">Shankar Bhavan</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Ram Bhavan">Ram Bhavan</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="Krishna Bhavan">Krishna Bhavan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-blue-100/50 backdrop-blur-md shadow-lg">
                                        <SelectItem className="hover:bg-blue-200/50" value="all">All Categories</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="electricity">Electricity</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="plumbing">Plumbing</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="carpentry">Carpentry</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-blue-100/50 backdrop-blur-md shadow-lg">
                                        <SelectItem className="hover:bg-blue-200/50" value="all">All Priorities</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="high">High</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="medium">Medium</SelectItem>
                                        <SelectItem className="hover:bg-blue-200/50" value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    </div>

                                    <Button variant="outline" size="sm" onClick={handleExportPdf} className="w-full">
                                    <Printer className="w-4 h-4 mr-2" /> Export PDF
                                    </Button>

                                    <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                                        <Filter className="w-4 h-4 mr-2" /> Reset Filters
                                    </Button>
                                </div>
                                

                                {/* Request List */}
                                <div className="space-y-3 mt-4 max-h-[calc(100vh-420px)] overflow-y-auto pr-1">
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map((request: MaintenanceRequest) => (
                                            <div
                                                key={request.id}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedRequest?.id === request.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                                                    }`}
                                                onClick={() => setSelectedRequest(request)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="text-gray-900 font-semibold">
                                                        {request.name} - {request.id}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                                        {getCategoryIcon(request.category)}
                                                        <span className="ml-2 capitalize">{request.category}</span>
                                                        </div>
                                                    </div>
                                                    <div>{getStatusBadge(request)}</div>
                                                    </div>

                                                    <div className="mb-2">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Building className="w-4 h-4 mr-1" />
                                                        <span>{getHostelName(request.building)} - Room {request.roomNo}</span>
                                                    </div>
                                                    </div>

                                                <div className="flex justify-between items-center mt-2">
                                                    <div className="text-xs text-gray-500">{formatDate(request.created_at)}</div>
                                                    <div className="flex items-center">{getPriorityBadge(request.priority)}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                            <p>No maintenance requests found</p>
                                            <p className="text-sm">Try adjusting your filters</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Request Details */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            {selectedRequest ? (
                                <>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-xl flex items-center">
                                                <span>Request {selectedRequest.id}</span>
                                                <span className="ml-3">{getStatusBadge(selectedRequest)}</span>
                                            </CardTitle>
                                            
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="details">
                                            <TabsList className="mb-4 bg-white shadow-md rounded-lg flex overflow-hidden border border-gray-300">
                                                <TabsTrigger
                                                    value="details"
                                                    className="w-1/2 py-2 text-center text-gray-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white border-r border-gray-300 transition-colors"
                                                >
                                                    Details
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="actions"
                                                    className="w-1/2 py-2 text-center text-gray-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-colors"
                                                >
                                                    Actions
                                                </TabsTrigger>
                                                </TabsList>

                                            <TabsContent value="details" className="space-y-6">
                                                {/* Student Information */}
                                                <div>
                                                    <h3 className="text-lg font-medium mb-3">Student Information</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Name</p>
                                                            <p className="font-medium">{selectedRequest.name}</p>
                                                        </div>
                                                        
                                                        <div>
                                                            <p className="text-sm text-gray-500">Email</p>
                                                            <p className="font-medium">{selectedRequest.email}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Phone</p>
                                                            <p className="font-medium">{selectedRequest.phone || "Not provided"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Building</p>
                                                            <p className="font-medium">{getHostelName(selectedRequest.building)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Room Number</p>
                                                            <p className="font-medium">{selectedRequest.roomNo}</p>
                                                        </div>
                                                        
                                                    </div>
                                                </div>

                                                {/* Issue Details */}
                                                <div>
                                                    <h3 className="text-lg font-medium mb-3">Issue Details</h3>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <div>
                                                                <p className="text-sm text-gray-500">Category</p>
                                                                <div className="flex items-center mt-1">
                                                                    {getCategoryIcon(selectedRequest.category)}
                                                                    <p className="font-medium ml-1">{getCategoryName(selectedRequest.category)}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Priority</p>
                                                                <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Preferred Visit Time</p>
                                                                <p className="font-medium">
                                                                    {selectedRequest.visitTime === "morning" && "Morning (9:00 AM - 12:00 PM)"}
                                                                    {selectedRequest.visitTime === "afternoon" && "Afternoon (1:00 PM - 4:00 PM)"}
                                                                    {selectedRequest.visitTime === "evening" && "Evening (5:00 PM - 8:00 PM)"}
                                                                    {selectedRequest.visitTime === "any" && "Any Time"}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Assigned To</p>
                                                                <p className="font-medium">{selectedRequest.assignedTo || "Not assigned"}</p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-sm text-gray-500">Description</p>
                                                            <p className="mt-1 whitespace-pre-line">{selectedRequest.problem}</p>
                                                        </div>

                                                        {selectedRequest.hasImage && (
                                                            <div className="mt-4">
                                                                <p className="text-sm text-gray-500 mb-1">Attached Image</p>
                                                                <img
                                                                    src="/placeholder.svg?height=200&width=300"
                                                                    alt="Issue"
                                                                    className="rounded-lg border max-h-48 object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button onClick={() => handlePrint(selectedRequest)}>Print as PDF</Button>



                                            </TabsContent>
                                            <TabsContent value="actions" className="space-y-6">
                                                {/* Status Update */}
                                                <div>
                                                    <h3 className="text-lg font-medium mb-3">Update Status</h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        <Button
                                                            variant={selectedRequest.status === "pending" && !selectedRequest.isDeleted ? "default" : "outline"}
                                                            onClick={() => updateStatus(selectedRequest.id, "pending")}
                                                            disabled={isLoading || selectedRequest.isDeleted}
                                                            title={selectedRequest.isDeleted ? "Restore before updating status" : undefined}
                                                        >
                                                            <Clock className="w-4 h-4 mr-2" />
                                                            Mark as Pending
                                                        </Button>
                                                        <Button
                                                            variant={selectedRequest.status === "in-progress" && !selectedRequest.isDeleted ? "default" : "outline"}
                                                            onClick={() => updateStatus(selectedRequest.id, "in-progress")}
                                                            disabled={isLoading || selectedRequest.isDeleted}
                                                            title={selectedRequest.isDeleted ? "Restore before updating status" : undefined}
                                                        >
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            Mark as In Progress
                                                        </Button>
                                                        <Button
                                                             variant={selectedRequest.status === "completed" && !selectedRequest.isDeleted ? "default" : "outline"}
                                                            onClick={() => updateStatus(selectedRequest.id, "completed")}
                                                            disabled={isLoading || selectedRequest.isDeleted}
                                                            title={selectedRequest.isDeleted ? "Restore before updating status" : undefined}
                                                        >
                                                            <CheckCheck className="w-4 h-4 mr-2" />
                                                            Mark as Completed
                                                        </Button>
                                                    </div>
                                                </div>

                                                 {/* Soft Delete / Reopen */}
                                                <div className="space-y-3">
                                                <h3 className="text-lg font-medium">Archive Controls</h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {!isPast(selectedRequest) ? (
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => softDelete(selectedRequest.id)}
                                                        disabled={isLoading}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Soft Delete
                                                    </Button>
                                                    ) : (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => reopenRequest(selectedRequest.id)}
                                                        disabled={isLoading}
                                                    >
                                                        <RotateCcw className="w-4 h-4 mr-2" />
                                                        Reopen Request
                                                    </Button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Soft delete moves the request to Past. Reopen brings it back as Pending.
                                                </p>
                                                </div>

                                                {/* Assign Staff */}
                                                <div>
                                                    <h3 className="text-lg font-medium mb-3">Assign Maintenance Staff</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {maintenanceStaff.map((staff) => (
                                                            <div
                                                                key={staff.id}
                                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedRequest.assignedTo === staff.name
                                                                        ? "border-blue-500 bg-blue-50"
                                                                        : "border-gray-200 hover:border-blue-300"
                                                                    } ${selectedRequest.isDeleted ? "opacity-60 cursor-not-allowed" : ""}`}
                                                                    onClick={() => !selectedRequest.isDeleted && assignStaff(selectedRequest.id, staff.id)}
                                                            >
                                                                <div className="flex items-center">
                                                                    <Avatar className="h-8 w-8 mr-3">
                                                                        <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="font-medium">{staff.name}</p>
                                                                        <p className="text-xs text-gray-500">{staff.role}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                

                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-16">
                                    <div className="p-4 rounded-full bg-blue-100 mb-4">
                                        <Tool className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-800 mb-2">No Request Selected</h3>
                                    <p className="text-gray-500 text-center max-w-md">
                                        Select a maintenance request from the list to view details and take action
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}