"use client"

import React from "react"
import { useState, useRef, type FormEvent, type ChangeEvent } from "react"
import { useEffect } from 'react';
import {
    Building,
    User,
    BadgeIcon as IdCard,
    Mail,
    Phone,
    DoorOpen,
    ArrowRight,
    ArrowLeft,
    MessageSquare,
    Clock,
    Check,
    ChevronDown,
    Zap,
    Droplet,
    Hammer,
    Upload,
    PenToolIcon as Tool,
} from "lucide-react"
import { Card, CardContent } from "./components/card"
import {supabase} from "./supabaseClient"


export default function MaintenancePortal() {
    
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        name: "",
        
        email: "",
        phone: "",
        building: "",
        roomNo: "",
        category: "",
        problem: "",
        priority: "low",
        visitTime: "",
        termsCheck: false,
    })
    
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: ''
      });
    
    
    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();  
            if (user) {
                setUserDetails({
                    name: user.user_metadata.name || '',  
                    email: user.email || ''  
                });
                setFormData(prev => ({
                    ...prev,
                    name: user.user_metadata.name || '',
                    email: user.email || ''
                }));
            }
        })();
    }, []);
    
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [hasImage, setHasImage] = useState(false)
    
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [requestId, setRequestId] = useState("")

    
    const fileInputRef = useRef<HTMLInputElement>(null)

    
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target

        if (type === "checkbox") {
            const target = e.target as HTMLInputElement
            setFormData({
                ...formData,
                [name]: target.checked,
            })
        } else {
            setFormData({
                ...formData,
                [name]: value,
            })
        }
    }

    
    const handleCategorySelect = (category: string) => {
        setFormData({
            ...formData,
            category,
        })
    }

    
    const handlePrioritySelect = (priority: string) => {
        setFormData({
            ...formData,
            priority,
        })
    }

    
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const reader = new FileReader()

            reader.onload = (event) => {
                if (event.target) {
                    setImagePreview(event.target.result as string)
                    setHasImage(true)
                }
            }

            reader.readAsDataURL(file)
        }
    }

    
    const nextStep = () => {
        
        if (currentStep === 1) {
            if ( !formData.building || !formData.roomNo) {
                alert("Please fill in all required fields")
                return
            }
        }

        if (currentStep === 2) {
            if (!formData.category || !formData.problem) {
                alert("Please select a category and describe your issue")
                return
            }
        }

        setCurrentStep(currentStep + 1)
    }

    const prevStep = () => {
        setCurrentStep(currentStep - 1)
    }

    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
    
        if (!formData.termsCheck) {
            alert("Please accept the terms to continue");
            return;
        }
    
        setIsSubmitting(true);
    
        try {
            const { data, error } = await supabase
                .from('maintenance_requests') 
                .insert([
                    {
                        name: userDetails.name,
                        email: userDetails.email,
                        phone: formData.phone,
                        building: formData.building,
                        roomNo: formData.roomNo,  
                        category: formData.category,
                        problem: formData.problem,
                        priority: formData.priority,
                        visitTime: formData.visitTime,
                        termsCheck: formData.termsCheck,
                        
                        

                        
                    }
                ]);
    
            if (error) {
                console.error("Supabase error details:", error);
    alert(`Error: ${error.message}`);
    return;
            }
    
            alert("Form submitted successfully!");
            
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("Something went wrong!");
        } finally {
            setIsSubmitting(false); 
        }
    };
    
    
    const resetForm = () => {
        setFormData({
            name: "",
            
            email: "",
            phone: "",
            building: "",
            roomNo: "",
            category: "",
            problem: "",
            priority: "low",
            visitTime: "",
            termsCheck: false,
        })
        setImagePreview(null)
        setHasImage(false)
        setCurrentStep(1)
        setShowSuccess(false)
    }
    

    
    const getBuildingName = () => {
        if (!formData.building) return "-"
        const buildings: Record<string, string> = {
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
        return buildings[formData.building] || "-"
    }

    
    const getCategoryName = () => {
        if (!formData.category) return "-"
        const categories: Record<string, string> = {
            electricity: "Electricity",
            plumbing: "Plumbing",
            carpentry: "Carpentry",
        }
        return categories[formData.category] || "-"
    }

    
    const getPriorityName = () => {
        if (!formData.priority) return "Low"
        const priorities: Record<string, string> = {
            low: "Low",
            medium: "Medium",
            high: "High",
        }
        return priorities[formData.priority] || "Low"
    }

    
    const getVisitTimeName = () => {
        if (!formData.visitTime) return "-"
        const visitTimes: Record<string, string> = {
            morning: "Morning (9:00 AM - 12:00 PM)",
            afternoon: "Afternoon (1:00 PM - 4:00 PM)",
            evening: "Evening (5:00 PM - 8:00 PM)",
            any: "Any Time",
        }
        return visitTimes[formData.visitTime] || "-"
    }

    return (
        
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27 viewBox=%270 0 100 100%27%3E%3Cg fillRule=%27evenodd%27%3E%3Cg fill=%27%233b82f6%27 fillOpacity=%270.05%27%3E%3Cpath opacity=%27.5%27 d=%27M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]">
                    <Card className="w-full max-w-3xl shadow-2xl animate-fade-in bg-white/95 rounded-2xl border border-gray-200/50">
                <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 p-8 text-white rounded-t-2xl overflow-hidden">
                    <div className="flex items-center justify-center mb-3">
                        <Tool className="w-8 h-8 mr-3" />
                        <h1 className="text-3xl font-bold">Campus Maintenance Portal</h1>
                        
                    </div>
                    

                    <p className="text-center text-blue-100 mt-1 text-lg">Submit your maintenance issues for prompt resolution</p>
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: "40px" }}>
                        <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: "100%", width: "100%" }}>
                            <path
                                d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                                style={{ stroke: "none", fill: "#fff" }}
                            ></path>
                        </svg>
                    </div>
                </div>

                <CardContent className="p-8">
                    {/* Step Indicator */}
                    <div className="flex justify-between mb-4">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`flex flex-col items-center ${step === currentStep ? "text-gray-900" : step < currentStep ? "text-green-600" : "text-gray-400"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step === currentStep
                                            ? "bg-blue-500 text-white"
                                            : step < currentStep
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-200"
                                        }`}
                                >
                                    {step < currentStep ? <Check className="w-4 h-4" /> : step}
                                </div>
                                <div className="text-xs">{step === 1 ? "Personal Info" : step === 2 ? "Issue Details" : "Review"}</div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 bg-gray-200 rounded mb-6">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        ></div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name Field */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                value={userDetails.name}
                                                
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300 focus:outline-none"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                value={userDetails.email}
                                                
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300 focus:outline-none"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Field */}
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                
                                                if (/^\d{0,10}$/.test(value)) {
                                                handleInputChange(e);
                                                }
                                            }}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300 focus:outline-none"
                                            placeholder="Enter your 10-digit phone number"
                                            maxLength={10}
                                            />

                                        </div>
                                    </div>

                                    {/* Building Selection */}
                                    <div>
                                        <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-1">
                                            Hostel
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Building className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <select
                                                id="building"
                                                name="building"
                                                required
                                                value={formData.building}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300 focus:outline-none appearance-none bg-white"
                                            >
                                                
                                                <option value="" disabled>Select your Hostel </option>
                                                <option value="Viswakarma Bhavan">Viswakarma Bhavan</option>
                                                <option value="Valmiki Bhavan">Valmiki Bhavan</option>
                                                <option value="Gautham Bhavan">Gautham Bhavan</option>
                                                <option value="Gandhi Bhavan">Gandhi Bhavan</option>
                                                <option value="Budh Bhavan">Budh Bhavan</option>
                                                <option value="Malaivya Bhavan">Malaivya Bhavan</option>
                                                <option value="Meera Bhavan">Meera Bhavan</option>
                                                <option value="Shankar Bhavan">Shankar Bhavan</option>
                                                <option value="Ram Bhavan">Ram Bhavan</option>
                                                <option value="Krishna Bhavan">Krishna Bhavan</option>


                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room Number Field */}
                                    <div>
                                        <label htmlFor="roomNo" className="block text-sm font-medium text-gray-700 mb-1">
                                            Room Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DoorOpen className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="roomNo"
                                                name="roomNo"
                                                required
                                                value={formData.roomNo}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300 focus:outline-none"
                                                placeholder="Enter your room number (e.g., 101)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="button"
                                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium shadow-lg hover:translate-y-[-2px] transition-all duration-300 flex items-center"
                                        onClick={nextStep}
                                    >
                                        Next Step <ArrowRight className="ml-2 w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Issue Details */}
                        {currentStep === 2 && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Issue Details</h2>

                                {/* Category Selection Cards */}
                                <label className="block text-sm font-medium text-gray-700 mb-3">Issue Category</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {/* Electricity Card */}
                                    <div
                                        className={`p-4 rounded-lg bg-white shadow-md hover:shadow-lg flex flex-col items-center cursor-pointer hover:translate-y-[-5px] transition-all duration-300 ${formData.category === "electricity"
                                                ? "border-2 border-blue-500 bg-blue-50"
                                                : "border-2 border-transparent"
                                            }`}
                                        onClick={() => handleCategorySelect("electricity")}
                                    >
                                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mb-2 transition-transform duration-300 transform hover:scale-110">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-medium">Electricity</h3>
                                        <p className="text-xs text-gray-500 text-center mt-1">Power, lights, fans, sockets, etc.</p>
                                    </div>

                                    {/* Plumbing Card */}
                                    <div
                                        className={`p-4 rounded-lg bg-white shadow-md hover:shadow-lg flex flex-col items-center cursor-pointer hover:translate-y-[-5px] transition-all duration-300 ${formData.category === "plumbing"
                                                ? "border-2 border-blue-500 bg-blue-50"
                                                : "border-2 border-transparent"
                                            }`}
                                        onClick={() => handleCategorySelect("plumbing")}
                                    >
                                        <div className="p-3 rounded-full bg-blue-100 text-blue-500 mb-2 transition-transform duration-300 transform hover:scale-110">
                                            <Droplet className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-medium">Plumbing</h3>
                                        <p className="text-xs text-gray-500 text-center mt-1">Water, drains, toilets, taps, etc.</p>
                                    </div>

                                    {/* Carpentry Card */}
                                    <div
                                        className={`p-4 rounded-lg bg-white shadow-md hover:shadow-lg flex flex-col items-center cursor-pointer hover:translate-y-[-5px] transition-all duration-300 ${formData.category === "carpentry"
                                                ? "border-2 border-blue-500 bg-blue-50"
                                                : "border-2 border-transparent"
                                            }`}
                                        onClick={() => handleCategorySelect("carpentry")}
                                    >
                                        <div className="p-3 rounded-full bg-amber-100 text-amber-600 mb-2 transition-transform duration-300 transform hover:scale-110">
                                            <Hammer className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-medium">Carpentry</h3>
                                        <p className="text-xs text-gray-500 text-center mt-1">Furniture, doors, windows, etc.</p>
                                    </div>
                                </div>

                                {/* Problem Description */}
                                <div className="mb-5">
                                    <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">
                                        Describe Your Issue
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                            <MessageSquare className="w-5 h-5 text-gray-400 mt-1" />
                                        </div>
                                        <textarea
                                            id="problem"
                                            name="problem"
                                            rows={4}
                                            required
                                            value={formData.problem}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300 focus:outline-none resize-none"
                                            placeholder="Please describe your issue in detail..."
                                        ></textarea>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Provide a clear description to help maintenance staff prepare appropriately
                                    </div>
                                </div>

                                {/* Priority Selection */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                                    <div className="flex flex-wrap gap-3">
                                        {["low", "medium", "high"].map((priority) => (
                                            <div
                                                key={priority}
                                                onClick={() => handlePrioritySelect(priority)}
                                                className={`inline-flex items-center px-4 py-2 rounded-full border-2 cursor-pointer hover:bg-gray-100 transition-all duration-300 ${formData.priority === priority
                                                        ? "bg-blue-100 border-blue-400 text-blue-700"
                                                        : "border-gray-300 text-gray-600"
                                                    }`}
                                            >
                                                <Clock className="w-4 h-4 mr-1" />
                                                <span className="capitalize">{priority}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                
                                
                                {/* Best Time for Visit */}
                                <div className="mb-5">
                                    <label htmlFor="visitTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        Preferred Visit Time
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="visitTime"
                                            name="visitTime"
                                            value={formData.visitTime}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300 focus:outline-none appearance-none bg-white"
                                        >
                                            <option value="" disabled>
                                                Select preferred time
                                            </option>
                                            <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                                            <option value="afternoon">Afternoon (1:00 PM - 4:00 PM)</option>
                                            <option value="evening">Evening (5:00 PM - 8:00 PM)</option>
                                            <option value="any">Any Time</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        When would be the best time for maintenance staff to visit?
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <button
                                        type="button"
                                        className="px-6 py-3 rounded-lg text-gray-600 font-medium border-2 border-gray-300 hover:bg-gray-100 transition-all duration-300 flex items-center"
                                        onClick={prevStep}
                                    >
                                        <ArrowLeft className="mr-2 w-5 h-5" /> Previous
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium shadow-lg hover:translate-y-[-2px] transition-all duration-300 flex items-center"
                                        onClick={nextStep}
                                    >
                                        Review Request <ArrowRight className="ml-2 w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Review Your Request</h2>

                                <div className="bg-gray-50 p-5 rounded-lg border mb-6">
                                    <h3 className="font-medium text-gray-700 mb-3">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium text-gray-800">{formData.name || "-"}</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-800">{formData.email || "-"}</p>
                                        </div>
                                        <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-800">{formData.phone || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Building</p>
                                            <p className="font-medium text-gray-800">{getBuildingName()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Room Number</p>
                                            <p className="font-medium text-gray-800">{formData.roomNo || "-"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-lg border mb-6">
                                    <h3 className="font-medium text-gray-700 mb-3">Issue Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Category</p>
                                            <p className="font-medium text-gray-800">{getCategoryName()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Priority</p>
                                            <p className="font-medium text-gray-800">{getPriorityName()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Preferred Visit Time</p>
                                            <p className="font-medium text-gray-800">{getVisitTimeName()}</p>
                                        </div>
                                        
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Description</p>
                                        <p className="font-medium text-gray-800 whitespace-pre-line">{formData.problem || "-"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center mb-5">
                                    <input
                                        type="checkbox"
                                        id="termsCheck"
                                        name="termsCheck"
                                        checked={formData.termsCheck}
                                        onChange={(e) => setFormData({ ...formData, termsCheck: e.target.checked })}
                                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                        required
                                    />
                                    <label htmlFor="termsCheck" className="ml-2 text-sm text-gray-700">
                                        I confirm that the information provided is accurate and I understand that submitting false
                                        information may result in delays.
                                    </label>
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <button
                                        type="button"
                                        className="px-6 py-3 rounded-lg text-gray-600 font-medium border-2 border-gray-300 hover:bg-gray-100 transition-all duration-300 flex items-center"
                                        onClick={prevStep}
                                    >
                                        <ArrowLeft className="mr-2 w-5 h-5" /> Previous
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium shadow-lg hover:translate-y-[-2px] transition-all duration-300 flex items-center"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Request <Check className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={resetForm}></div>
                    <div className="bg-white rounded-lg p-8 max-w-md w-full relative z-10 shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Request Submitted Successfully!</h3>
                            <p className="text-gray-600 mb-4">
                                Your maintenance request has been received. We will process it shortly.
                            </p>
                            <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
                                <p className="text-sm text-blue-800">
                                    <strong>Request ID:</strong> <span>{requestId}</span>
                                </p>
                                <p className="text-sm text-blue-800 mt-1">
                                    <strong>Estimated Response:</strong> Within 24 hours
                                </p>
                            </div>
                            <button
                                onClick={resetForm}
                                className="w-full py-3 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

