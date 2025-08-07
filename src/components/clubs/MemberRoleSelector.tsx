"use client";

import { useState } from 'react';

interface MemberRoleSelectorProps {
  membershipId: string;
  currentRole: string;
  memberName: string;
  onRoleUpdate: (newRole: string) => void;
}

const roles = ['General Member','Executive', 'Senior Executive'];

export default function MemberRoleSelector({
  membershipId,
  currentRole,
  memberName,
  onRoleUpdate
}: MemberRoleSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/memberships/${membershipId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        onRoleUpdate(newRole);
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating role');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">{memberName}:</span>
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value)}
        disabled={isUpdating}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      {isUpdating && (
        <span className="text-xs text-gray-500">Updating...</span>
      )}
    </div>
  );
}