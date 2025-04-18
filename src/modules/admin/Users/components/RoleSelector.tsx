import { Check, X } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleSelectorProps {
  value: string;
  onSave: (role: string) => void;
  onCancel: () => void;
}

export function RoleSelector({ value, onSave, onCancel }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState(value);

  const handleSave = () => {
    onSave(selectedRole);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedRole} onValueChange={setSelectedRole}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-green-600"
          onClick={handleSave}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-600"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
