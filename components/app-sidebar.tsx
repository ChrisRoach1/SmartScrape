'use client';

import * as React from 'react';
import { Home, Inbox, LogOut, Library, Users, Settings } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useUser, useClerk, UserAvatar } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Summarize',
    url: '/dashboard/summarize',
    icon: Inbox,
  },
  {
    title: 'Sources',
    url: '/dashboard/sources',
    icon: Library,
  },
  {
    title: 'Competitors',
    url: '/dashboard/competitors',
    icon: Users,
  },  
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },    
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  return (
    <Sidebar variant='floating' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href='/' className='group flex items-center gap-2.5 transition-transform hover:scale-[1.02]'>
              <span className='text-lg font-bold tracking-tight ml-2'>
                Smart<span className='text-primary'>Scrape</span>
              </span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!isLoaded ? (
          <div className='flex items-center gap-3 p-2'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-32' />
            </div>
          </div>
        ) : user ? (
          <div className='flex items-center gap-3 p-2'>
            <UserAvatar />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium'>{user.fullName || 'User'}</p>
              <p className='text-xs text-muted-foreground truncate'>{user.primaryEmailAddress?.emailAddress || 'No email'}</p>
            </div>
            <Button variant='ghost' size='icon' className='h-8 w-8 shrink-0' onClick={() => signOut({ redirectUrl: '/' })} title='Sign out'>
              <LogOut className='h-4 w-4' />
            </Button>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
