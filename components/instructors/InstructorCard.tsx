"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Award, CheckCircle, BookOpen } from "lucide-react";

interface InstructorCardProps {
  id: string;
  name: string;
  slug: string;
  bio: string;
  photoUrl: string | null;
  credentials: string[];
  specialties: string[];
  experience: number | null;
  location: string | null;
  featured: boolean;
  verified: boolean;
  programCount: number;
}

export default function InstructorCard({
  name,
  slug,
  bio,
  photoUrl,
  credentials,
  specialties,
  experience,
  location,
  featured,
  verified,
  programCount,
}: InstructorCardProps) {
  return (
    <Link
      href={`/instructors/${slug}`}
      className={`block bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all group ${
        featured ? "border-green-200 ring-1 ring-green-100" : "border-gray-200"
      }`}
    >
      {/* Photo section */}
      <div className="relative h-48 bg-linear-to-br from-green-100 to-teal-100">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-4xl font-bold text-green-600">
                {name.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Featured
          </div>
        )}

        {/* Verified badge */}
        {verified && (
          <div className="absolute top-3 right-3 bg-white/90 text-green-600 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-green-600 transition-colors">
          {name}
        </h3>

        {/* Location & Experience */}
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </span>
          )}
          {experience && (
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {experience}+ years
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{bio}</p>

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {specialty}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="text-xs text-gray-400">
                +{specialties.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Credentials */}
        {credentials.length > 0 && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-1">
            {credentials.join(" • ")}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <BookOpen className="w-4 h-4" />
            {programCount} program{programCount !== 1 && "s"}
          </span>
          <span className="text-sm text-green-600 font-medium group-hover:underline">
            View Profile
          </span>
        </div>
      </div>
    </Link>
  );
}
