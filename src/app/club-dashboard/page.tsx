"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ClubDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
 
  type ApprovedMember = {
    id: string;
    user: {
      name: string;
      email: string;
    };
    club?: {
      id: string;
      name: string;
      department?: string;
    };
    role: string;
    joinedAt?: string;
    createdAt?: string;
  };

  const [approvedMembers, setApprovedMembers] = useState<ApprovedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'CLUB_LEADER') {
      router.push('/dashboard');
      return;
    }

    fetchClubData();
  }, [session, status]);

  const fetchClubData = async () => {
    try {
      const response = await fetch('/api/club-leader/memberships');
      if (response.ok) {
        const data = await response.json();

        setClubs(data.clubs || []);
        setSelectedClub(data.clubs && data.clubs.length > 0 ? data.clubs[0] : null);

        const sortedApproved = (data.approvedMemberships || []).slice().sort((a: ApprovedMember, b: ApprovedMember) => {
          
          const dateA = new Date(a.joinedAt || a.createdAt || '1970-01-01').getTime();
          const dateB = new Date(b.joinedAt || b.createdAt || '1970-01-01').getTime();
          return dateB - dateA;
        });
        setApprovedMembers(sortedApproved);
        
      } else {
        console.error('API response not OK:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error fetching club data:', error);
    } finally {
      setLoading(false);
    }
  };


  // Only shows members for selected club, sorted by latest approved, and filtered by name
  const filteredApprovedMembers = (() => {
    let members = approvedMembers.filter(m => m.club?.id === selectedClub?.id);
    
    members = members.filter(m => m.user.email !== session?.user?.email);
    members = members.sort((a, b) => {
      const dateA = new Date(a.joinedAt || a.createdAt || '1970-01-01').getTime();
      const dateB = new Date(b.joinedAt || b.createdAt || '1970-01-01').getTime();
      return dateB - dateA;
    });
    return members.filter(m => m.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
  })();

  if (loading) return <div>Loading...</div>;
  if (!clubs || clubs.length === 0) return <div>No clubs found. You are not assigned as a leader of any club.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Club Leadership Dashboard</h1>
      <div className="mb-6">
        <span className="text-gray-600 self-center mr-2">Managing clubs:</span>
        {clubs.map((club) => (
          <button
            key={club.id}
            onClick={() => setSelectedClub(club)}
            className={`px-4 py-2 rounded-lg border transition-colors mr-2 mb-2 ${
              selectedClub?.id === club.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {club.name}
          </button>
        ))}
      </div>
      {selectedClub && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-800">Currently viewing: {selectedClub.name}</h2>
          {selectedClub.department && (
            <p className="text-blue-600">Department: {selectedClub.department}</p>
          )}
        </div>
      )}
      {/* Current Members */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Current Members ({filteredApprovedMembers.length})</h2>
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-green-700">
            Here you can view all approved members and their roles (General Member, Executive, Senior Executive).
          </p>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by member name..."
            className="w-full max-w-md px-3 py-2 border rounded-md"
          />
        </div>
        {filteredApprovedMembers.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <p className="text-yellow-800 font-medium">No approved members found</p>
            <p className="text-yellow-600 text-sm mt-1">
              Try searching by name, or approve pending membership requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApprovedMembers.map((membership) => (
              <div key={membership.id} className="flex justify-between items-center p-4 border rounded-lg bg-white shadow-sm">
                <div>
                  <h4 className="font-medium">{membership.user.name}</h4>
                  <p className="text-sm text-gray-600">{membership.user.email}</p>
                  <p className="text-sm text-purple-600 mt-1">Club: {membership.club?.name || 'Unknown Club'}</p>
                  <p className="text-sm text-blue-600 mt-1">Current Role: {membership.role}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Joined: {membership.joinedAt ? new Date(membership.joinedAt).toLocaleString() : (membership.createdAt ? new Date(membership.createdAt).toLocaleString() : 'N/A')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}