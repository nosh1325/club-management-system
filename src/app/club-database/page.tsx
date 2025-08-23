"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MemberRoleSelector from '@/components/clubs/MemberRoleSelector';

export default function ClubDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
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
  };
  const [clubMembers, setClubMembers] = useState<{ [clubId: string]: ApprovedMember[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerms, setSearchTerms] = useState<{ [clubId: string]: string }>({});
  const [openClubs, setOpenClubs] = useState<{ [clubId: string]: boolean }>({});

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
        
        const membersByClub: { [clubId: string]: ApprovedMember[] } = {};
        (data.approvedMemberships || []).forEach((m: ApprovedMember) => {
          const clubId = m.club?.id || 'unknown';
          if (!membersByClub[clubId]) membersByClub[clubId] = [];
          membersByClub[clubId].push(m);
        });
        
        const roleOrder: { [key: string]: number } = { 
          'General Member': 0, 
          'Executive': 1, 
          'Senior Executive': 2 
        };
        Object.keys(membersByClub).forEach(clubId => {
          membersByClub[clubId].sort((a, b) => {
            const aRole = roleOrder[a.role] ?? 99;
            const bRole = roleOrder[b.role] ?? 99;
            return aRole - bRole;
          });
        });
        setClubMembers(membersByClub);
      } else {
        const errorText = await response.text();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipAction = async (membershipId: string, action: string) => {
    try {
      const response = await fetch('/api/club-leader/memberships', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          membershipIds: [membershipId], 
          action: action 
        }),
      });

      if (response.ok) {
        fetchClubData(); 
      } else {
        const errorData = await response.json();
      }
    } catch (error) {
    }
  };

 

  if (loading) return <div>Loading...</div>;
  if (!clubs || clubs.length === 0) return <div>No clubs found. You are not assigned as a leader of any club.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Club Leadership Dashboard</h1>
      <div className="space-y-6">
        {clubs.map(club => {
          const members = clubMembers[club.id] || [];
          const searchTerm = searchTerms[club.id] || '';
          const filteredMembers = members.filter(m =>
            m.user.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          const isOpen = openClubs[club.id] ?? false;
          return (
            <div key={club.id} className="border rounded-lg shadow-sm">
              <button
                className={`w-full text-left px-6 py-4 bg-blue-50 border-b font-semibold text-lg flex justify-between items-center`}
                onClick={() => setOpenClubs(prev => ({ ...prev, [club.id]: !isOpen }))}
              >
                <span>{club.name}</span>
                <span>{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="p-6">
                  <div className="mb-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerms(prev => ({ ...prev, [club.id]: e.target.value }))}
                      placeholder="Search by member name..."
                      className="w-full max-w-md px-3 py-2 border rounded-md"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-green-600">Members ({filteredMembers.length})</h2>
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-green-700">
                      View and manage approved members. Assign roles: General Member, Executive, Senior Executive.
                    </p>
                  </div>
                  {filteredMembers.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                      <p className="text-yellow-800 font-medium">No approved members found</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Try searching by name, or approve pending membership requests.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredMembers.map(membership => (
                        <div key={membership.id} className="flex justify-between items-center p-4 border rounded-lg bg-white shadow-sm">
                          <div>
                            <h4 className="font-medium">{membership.user.name}</h4>
                            <p className="text-sm text-gray-600">{membership.user.email}</p>
                            <p className="text-sm text-blue-600 mt-1">Current Role: {membership.role}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <label className="text-sm font-medium text-gray-700 mb-1">Change Role:</label>
                            <MemberRoleSelector
                              membershipId={membership.id}
                              currentRole={membership.role}
                              memberName={membership.user.name}
                              onRoleUpdate={async (newRole: string) => {
                                await fetch('/api/club-leader/memberships', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    membershipIds: [membership.id],
                                    action: 'role',
                                    newRole,
                                  }),
                                });
                                fetchClubData();
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
