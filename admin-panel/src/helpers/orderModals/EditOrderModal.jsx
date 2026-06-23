import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

import { LuPencilLine } from "react-icons/lu";
import { IoChevronDown, IoClose } from "react-icons/io5";

import { State, City } from "country-state-city";

import { normalizeGooglePhoto } from "../../utils/format";

export default function EditOrderModal({ order, setEditModal }) {

    const navigate = useNavigate();
    const { isDark } = useTheme();

    const [isStateOpen, setIsStateOpen] = useState(false);
    const [isCityOpen, setIsCityOpen] = useState(false);

    const stateRef = useRef(null);
    const cityRef = useRef(null);

    const [stateSearch, setStateSearch] = useState(
        order?.shippingAddress?.state || ""
    );

    const [citySearch, setCitySearch] = useState(
        order?.shippingAddress?.city || ""
    );

    const [shippingAddress, setShippingAddress] = useState({
        fullName: order?.shippingAddress?.fullName || "",
        phone: order?.shippingAddress?.phone || "",
        addressLine1: order?.shippingAddress?.addressLine1 || "",
        addressLine2: order?.shippingAddress?.addressLine2 || "",
        country: "India",
        state: order?.shippingAddress?.state || "",
        city: order?.shippingAddress?.city || "",
        pincode: order?.shippingAddress?.pinCode || "",
    });

    // States
    const states = useMemo(() => {
        return State.getStatesOfCountry("IN");
    }, []);

    // Filtered States
    const filteredStates = states.filter((state) =>
        state?.name
            ?.toLowerCase()
            ?.includes(stateSearch?.toLowerCase())
    );

    // Selected State
    const selectedState = states.find(
        (state) => state.name === shippingAddress.state
    );

    // Cities
    const cities = useMemo(() => {

        if (!selectedState) return [];

        return City.getCitiesOfState(
            "IN",
            selectedState.isoCode
        );

    }, [selectedState]);

    // Filtered Cities
    const filteredCities = cities.filter((city) =>
        city?.name
            ?.toLowerCase()
            ?.includes(citySearch?.toLowerCase())
    );

    // Close Dropdowns
    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                stateRef.current &&
                !stateRef.current.contains(event.target)
            ) {
                setIsStateOpen(false);
            }

            if (
                cityRef.current &&
                !cityRef.current.contains(event.target)
            ) {
                setIsCityOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);

    // Input Change
    const handleChange = (field, value) => {
        setShippingAddress((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Save
    const handleSave = () => {
        console.log(shippingAddress);

        // api call here
    };

    return (

        <div className="fixed inset-0 z-999 bg-black/40 flex items-center justify-center p-3 md:p-6">

            <div
                className={`
                    w-full max-w-4xl max-h-[92vh]
                    overflow-hidden rounded-3xl
                    flex flex-col zoom-modal
                    ${isDark
                        ? "bg-[#0F172A] border border-white/10 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }
                `}
            >

                {/* Header */}
                <div
                    className={`
                        px-6 py-5 border-b flex items-center justify-between shrink-0
                        ${isDark ? "border-white/10" : "border-gray-200"}
                    `}
                >

                    <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl">
                            <LuPencilLine />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold">
                                Edit Order
                            </h2>

                            <p
                                className={`text-sm mt-1 ${isDark
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                    }`}
                            >
                                Update shipping details for
                                <span className="text-purple-500 font-semibold ml-1">
                                    #{order?.orderId}
                                </span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setEditModal(false)}
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center
                            transition-all
                            ${isDark
                                ? "hover:bg-white/10"
                                : "hover:bg-gray-100"
                            }
                        `}
                    >
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Customer Card */}
                    <div
                        className={`
                            rounded-2xl border p-4 flex items-center gap-4
                            ${isDark
                                ? "bg-white/[0.03] border-white/10"
                                : "bg-gray-50 border-gray-200"
                            }
                        `}
                    >

                        <img
                            src={
                                normalizeGooglePhoto(order?.user?.avatar) ||
                                (isDark
                                    ? "/user.png"
                                    : "/userLight.png")
                            }
                            alt="customer"
                            className="w-14 h-14 rounded-full object-cover"
                        />

                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                                {order?.user?.name}
                            </h3>

                            <p
                                className={`text-sm ${isDark
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                    }`}
                            >
                                {order?.user?.email}
                            </p>
                        </div>

                        <div
                            className={`
                                px-3 py-1 rounded-full text-xs font-medium
                                ${isDark
                                    ? "bg-white/10 text-gray-300"
                                    : "bg-gray-200 text-gray-700"
                                }
                            `}
                        >
                            Read Only
                        </div>
                    </div>

                    {/* Shipping */}
                    <div
                        className={`
                            rounded-2xl border p-5
                            ${isDark
                                ? "bg-white/[0.03] border-white/10"
                                : "bg-gray-50 border-gray-200"
                            }
                        `}
                    >

                        <div className="mb-5">
                            <h3 className="text-lg font-semibold">
                                Shipping Address
                            </h3>

                            <p
                                className={`text-sm mt-1 ${isDark
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                    }`}
                            >
                                Only receiver and delivery details can be edited.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Receiver Name */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Receiver Name
                                </label>

                                <input
                                    type="text"
                                    value={shippingAddress.fullName}
                                    onChange={(e) =>
                                        handleChange(
                                            "fullName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Receiver Name"
                                    className={`
                                        w-full h-12 rounded-xl px-4 outline-none border transition-all
                                        ${isDark
                                            ? "bg-[#1E293B] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                                            : "bg-white border-gray-300 focus:border-purple-500"
                                        }
                                    `}
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    maxLength={10}
                                    value={shippingAddress.phone}
                                    onChange={(e) =>
                                        handleChange(
                                            "phone",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Phone Number"
                                    className={`
                                        w-full h-12 rounded-xl px-4 outline-none border transition-all
                                        ${isDark
                                            ? "bg-[#1E293B] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                                            : "bg-white border-gray-300 focus:border-purple-500"
                                        }
                                    `}
                                />
                            </div>

                            {/* Address 1 */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1.5">
                                    Address Line 1
                                </label>

                                <input
                                    type="text"
                                    value={shippingAddress.addressLine1}
                                    onChange={(e) =>
                                        handleChange(
                                            "addressLine1",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Address Line 1"
                                    className={`
                                        w-full h-12 rounded-xl px-4 outline-none border transition-all
                                        ${isDark
                                            ? "bg-[#1E293B] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                                            : "bg-white border-gray-300 focus:border-purple-500"
                                        }
                                    `}
                                />
                            </div>

                            {/* Address 2 */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1.5">
                                    Address Line 2
                                </label>

                                <input
                                    type="text"
                                    value={shippingAddress.addressLine2}
                                    onChange={(e) =>
                                        handleChange(
                                            "addressLine2",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Address Line 2"
                                    className={`
                                        w-full h-12 rounded-xl px-4 outline-none border transition-all
                                        ${isDark
                                            ? "bg-[#1E293B] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                                            : "bg-white border-gray-300 focus:border-purple-500"
                                        }
                                    `}
                                />
                            </div>

                            {/* State */}
                            <div
                                className="relative"
                                ref={stateRef}
                            >

                                <label className="block text-sm font-medium mb-1.5">
                                    State
                                </label>

                                <div
                                    className={`
                                        w-full h-12 rounded-xl px-4 border flex items-center justify-between
                                        ${isDark
                                            ? "bg-[#1E293B] border-white/10"
                                            : "bg-white border-gray-300"
                                        }
                                    `}
                                >

                                    <input
                                        type="text"
                                        value={stateSearch}
                                        placeholder="Search State"
                                        onFocus={() => {
                                            setIsStateOpen(true);
                                            setIsCityOpen(false);
                                        }}
                                        onChange={(e) => {

                                            setStateSearch(e.target.value);

                                            setShippingAddress({
                                                ...shippingAddress,
                                                state: "",
                                                city: "",
                                            });

                                            setCitySearch("");
                                        }}
                                        className={`
                                            w-full bg-transparent outline-none
                                            ${isDark
                                                ? "placeholder:text-gray-500"
                                                : "placeholder:text-gray-400"
                                            }
                                        `}
                                    />

                                    <IoChevronDown
                                        onClick={() => {
                                            setIsStateOpen(!isStateOpen);
                                            setIsCityOpen(false);
                                        }}
                                        className={`
                                            cursor-pointer transition-all duration-300
                                            ${isStateOpen ? "rotate-180" : ""}
                                        `}
                                    />
                                </div>

                                {isStateOpen && (

                                    <div
                                        className={`
                                            absolute top-full left-0 mt-2 w-full rounded-xl border
                                            max-h-60 overflow-y-auto z-999 shadow-lg scrollbar-thin
                                            ${isDark
                                                ? "bg-[#1E293B] border-white/10"
                                                : "bg-white border-gray-200"
                                            }
                                        `}
                                    >

                                        {filteredStates.length > 0 ? (
                                            filteredStates.map((state) => (

                                                <div
                                                    key={state.isoCode}
                                                    onClick={() => {

                                                        setShippingAddress({
                                                            ...shippingAddress,
                                                            state: state.name,
                                                            city: "",
                                                        });

                                                        setStateSearch(state.name);
                                                        setCitySearch("");

                                                        setIsStateOpen(false);
                                                    }}
                                                    className={`
                                                        px-4 py-2 cursor-pointer transition-all
                                                        ${isDark
                                                            ? "hover:bg-white/10"
                                                            : "hover:bg-gray-100"
                                                        }
                                                    `}
                                                >
                                                    {state.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-400">
                                                No State Found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* City */}
                            <div
                                className="relative"
                                ref={cityRef}
                            >

                                <label className="block text-sm font-medium mb-1.5">
                                    City
                                </label>

                                <div
                                    className={`
                                        w-full h-12 rounded-xl px-4 border flex items-center justify-between
                                        ${isDark
                                            ? "bg-[#1E293B] border-white/10"
                                            : "bg-white border-gray-300"
                                        }
                                    `}
                                >

                                    <input
                                        type="text"
                                        value={citySearch}
                                        disabled={!shippingAddress.state}
                                        placeholder={
                                            shippingAddress.state
                                                ? "Search City"
                                                : "Select State First"
                                        }
                                        onFocus={() => {

                                            if (!shippingAddress.state) return;

                                            setIsCityOpen(true);
                                            setIsStateOpen(false);
                                        }}
                                        onChange={(e) => {

                                            setCitySearch(e.target.value);

                                            setShippingAddress({
                                                ...shippingAddress,
                                                city: "",
                                            });
                                        }}
                                        className={`
                                            w-full bg-transparent outline-none
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            ${isDark
                                                ? "placeholder:text-gray-500"
                                                : "placeholder:text-gray-400"
                                            }
                                        `}
                                    />

                                    <IoChevronDown
                                        onClick={() => {

                                            if (!shippingAddress.state) return;

                                            setIsCityOpen(!isCityOpen);
                                            setIsStateOpen(false);
                                        }}
                                        className={`
                                            cursor-pointer transition-all duration-300
                                            ${isCityOpen ? "rotate-180" : ""}
                                        `}
                                    />
                                </div>

                                {isCityOpen && (

                                    <div
                                        className={`
                                            absolute top-full left-0 mt-2 w-full rounded-xl border
                                            max-h-60 overflow-y-auto z-50 shadow-lg scrollbar-thin
                                            ${isDark
                                                ? "bg-[#1E293B] border-white/10"
                                                : "bg-white border-gray-200"
                                            }
                                        `}
                                    >

                                        {filteredCities.length > 0 ? (
                                            filteredCities.map((city, index) => (

                                                <div
                                                    key={index}
                                                    onClick={() => {

                                                        setShippingAddress({
                                                            ...shippingAddress,
                                                            city: city.name,
                                                        });

                                                        setCitySearch(city.name);

                                                        setIsCityOpen(false);
                                                    }}
                                                    className={`
                                                        px-4 py-2 cursor-pointer transition-all
                                                        ${isDark
                                                            ? "hover:bg-white/10"
                                                            : "hover:bg-gray-100"
                                                        }
                                                    `}
                                                >
                                                    {city.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-400">
                                                No City Found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Country
                                </label>

                                <input
                                    type="text"
                                    disabled
                                    value={shippingAddress.country}
                                    onChange={(e) =>
                                        handleChange(
                                            "pincode",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Pincode"
                                    className={`
                                        w-full h-12 rounded-xl px-4 outline-none border transition-all
                                        ${isDark
                                            ? "bg-[#1E293B] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                                            : "bg-white border-gray-300 focus:border-purple-500"
                                        }
                                    `}
                                />
                            </div>

                            {/* Pincode */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Pincode
                                </label>

                                <input
                                    type="text"
                                    value={shippingAddress.pincode}
                                    onChange={(e) =>
                                        handleChange(
                                            "pincode",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Pincode"
                                    className={`
                                        w-full h-12 rounded-xl px-4 outline-none border transition-all
                                        ${isDark
                                            ? "bg-[#1E293B] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                                            : "bg-white border-gray-300 focus:border-purple-500"
                                        }
                                    `}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className={`
                        border-t px-6 py-4 flex items-center justify-end gap-3 shrink-0
                        ${isDark ? "border-white/10" : "border-gray-200"}
                    `}
                >

                    <button
                        onClick={() => setEditModal(false)}
                        className={`
                            h-11 px-5 rounded-xl font-medium transition-all
                            ${isDark
                                ? "hover:bg-white/10 text-gray-300"
                                : "hover:bg-gray-100 text-gray-700"
                            }
                        `}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="
                            h-11 px-5 rounded-xl
                            bg-gradient-to-b from-purple-400 to-purple-600
                            text-white font-semibold
                            flex items-center gap-2
                            active:scale-95 transition-all
                            shadow-lg shadow-purple-500/20
                        "
                    >
                        <LuPencilLine className="text-lg" />

                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}