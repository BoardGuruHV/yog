"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Award,
  CheckCircle,
  Instagram,
  Youtube,
  Globe,
  Twitter,
  Clock,
  Eye,
  Copy,
} from "lucide-react";

interface PreviewAsana {
  id: string;
  name: string;
  svgPath: string;
  category: string;
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  totalDuration: number;
  poseCount: number;
  shareCode?: string;
  views: number;
  copies: number;
  previewAsanas: PreviewAsana[];
}

interface InstructorProfileProps {
  name: string;
  bio: string;
  longBio: string | null;
  photoUrl: string | null;
  coverUrl: string | null;
  credentials: string[];
  specialties: string[];
  experience: number | null;
  location: string | null;
  socialLinks: Record<string, string>;
  verified: boolean;
  programs: Program[];
}

export default function InstructorProfile({
  name,
  bio,
  longBio,
  photoUrl,
  coverUrl,
  credentials,
  specialties,
  experience,
  location,
  socialLinks,
  verified,
  programs,
}: InstructorProfileProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "youtube":
        return <Youtube className="w-5 h-5" />;
      case "twitter":
      case "x":
        return <Twitter className="w-5 h-5" />;
      case "website":
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cover & Photo */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl overflow-hidden">
          {coverUrl && (
            <Image
              src={coverUrl}
              alt={`${name} cover`}
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Profile Photo */}
        <div className="absolute -bottom-16 left-6">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={name}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                <span className="text-4xl font-bold text-green-600">
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-12 px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            {/* Name & Verified */}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {name}
              </h1>
              {verified && (
                <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>

            {/* Location & Experience */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </span>
              )}
              {experience && (
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {experience}+ years experience
                </span>
              )}
            </div>

            {/* Bio */}
            <p className="text-gray-600 mt-4 max-w-2xl">{bio}</p>
          </div>

          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="flex items-center gap-2">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                  title={platform}
                >
                  {getSocialIcon(platform)}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Credentials */}
        {credentials.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Credentials
            </h3>
            <div className="flex flex-wrap gap-2">
              {credentials.map((credential) => (
                <span
                  key={credential}
                  className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                >
                  {credential}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Long Bio */}
        {longBio && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
            <div className="prose prose-green max-w-none text-gray-600">
              {longBio.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Programs Section */}
      {programs.length > 0 && (
        <div className="px-6 py-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Programs by {name.split(" ")[0]}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program) => (
              <Link
                key={program.id}
                href={
                  program.shareCode
                    ? `/shared/${program.shareCode}`
                    : `/program?id=${program.id}`
                }
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Preview Images */}
                <div className="relative h-28 bg-gradient-to-br from-green-50 to-teal-50 p-3">
                  <div className="flex justify-center items-center h-full gap-2">
                    {program.previewAsanas.slice(0, 4).map((asana, index) => (
                      <div
                        key={asana.id}
                        className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden"
                        style={{
                          transform: `rotate(${(index - 1.5) * 3}deg)`,
                        }}
                      >
                        {asana.svgPath ? (
                          <Image
                            src={asana.svgPath}
                            alt={asana.name}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-xl">🧘</span>
                        )}
                      </div>
                    ))}
                    {program.poseCount > 4 && (
                      <div className="w-12 h-12 bg-white/80 rounded-lg shadow-sm flex items-center justify-center text-xs font-medium text-gray-500">
                        +{program.poseCount - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                    {program.name}
                  </h3>
                  {program.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {program.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(program.totalDuration)}
                      </span>
                      <span>{program.poseCount} poses</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {program.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" />
                        {program.copies}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No programs */}
      {programs.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          <p>No public programs yet.</p>
        </div>
      )}
    </div>
  );
}
