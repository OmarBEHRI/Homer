# Chat Feature Implementation Roadmap

## Overview
This document outlines the step-by-step implementation of a real-time chat feature using Convex for the backend and React/Next.js for the frontend.

---

## Phase 1: Database Schema & Backend Setup

### Step 1: Define Convex Schema
- [x] **Create messages table with fields:**
  - [x] `_id` (auto-generated)
  - [x] `chatId` (string, references chat)
  - [x] `senderId` (string, references user)
  - [x] `content` (string, message text)
  - [x] `createdAt` (timestamp)
  - [x] `seen` (boolean, default false)
  - [x] `seenAt` (timestamp, optional)

- [x] **Create chats table with fields:**
  - [x] `_id` (auto-generated)
  - [x] `participants` (array of user IDs)
  - [x] `lastMessageAt` (timestamp)
  - [x] `createdAt` (timestamp)

- [x] **Extend users table with:**
  - [x] `chatId` (unique identifier separate from _id)

- [x] **Create friendships table with fields:**
  - [x] `_id` (auto-generated)
  - [x] `userId` (string, references user)
  - [x] `friendId` (string, references user)
  - [x] `status` (string: 'pending', 'accepted', 'blocked')
  - [x] `createdAt` (timestamp)

### Step 2: Create Core Convex Functions

#### Queries:
- [x] **getUserByChatId.ts**
  - [x] Find user by their chatId
  - [x] Return user info (name, etc.)

- [x] **getChats.ts**
  - [x] Get all chats for current user
  - [x] Include last message preview
  - [x] Include unread count

- [x] **getMessages.ts**
  - [x] Get paginated messages for a chat (30 at a time)
  - [x] Support reverse pagination for infinite scroll
  - [x] Order by createdAt descending

- [x] **getUnseenMessageCount.ts**
  - [x] Count unseen messages for user across all chats
  - [x] Return total count for dock badge

- [x] **searchChatsAndMessages.ts**
  - [x] Search friends and messages
  - [x] Return both user matches and message matches

#### Mutations:
- [x] **addFriend.ts**
  - [x] Add friend and create empty chat
  - [x] Handle friendship status updates

- [x] **sendMessage.ts**
  - [x] Send a new message
  - [x] Update chat's lastMessageAt
  - [x] Set seen status to false for recipients

- [x] **markMessagesAsSeen.ts**
  - [x] Mark messages as seen when chat is opened
  - [x] Update seenAt timestamp

- [x] **createChat.ts**
  - [x] Create a new chat between users
  - [x] Initialize with empty participants array

---

## Phase 2: Friend Management

### Step 3: Create "Add Friend" Flow
- [x] **Create AddFriendModal component**
  - [x] Input field for entering friend's chatId
  - [x] Search button with loading state
  - [x] Error handling for invalid chatId

- [x] **Implement user search functionality**
  - [x] Query to search user by chatId
  - [x] Show user info (First Name, Last Name)
  - [x] Display "+" button to add friend

- [x] **Handle friend addition**
  - [x] On add, trigger mutation to create friendship
  - [x] Create empty chat between users
  - [x] Show success/error feedback

### Step 4: Friend Suggestion Component
- [x] **Display found user with basic info**
  - [x] User avatar/initials
  - [x] Full name display
  - [x] Add button to confirm friendship

- [x] **Handle loading and error states**
  - [x] Loading spinner during search
  - [x] Error messages for failed searches
  - [x] Success confirmation after adding

---

## Phase 3: Chat Sidebar

### Step 5: Create Chat List Sidebar Component
- [x] **Create ChatSidebar.tsx**
  - [x] Use Convex query to fetch all chats in real-time
  - [x] Responsive design for mobile/desktop

- [x] **Display each chat with:**
  - [x] Friend's name (from participants)
  - [x] Last message preview (truncated)
  - [x] Timestamp (relative time)
  - [x] Unread indicator (red dot with count)

### Step 6: Implement Search Functionality
- [x] **Add search input to sidebar**
  - [x] Real-time search as user types
  - [x] Debounced input for performance

- [x] **Use Convex query for real-time search**
  - [x] Display results in two sections:
    - [x] Friends matching search
    - [x] Messages matching search across all chats

- [x] **Handle search result interactions**
  - [x] Click on message result navigates to that specific message
  - [x] Click on friend result opens their chat

### Step 7: Add Active Chat Selection
- [x] **Highlight currently selected chat**
  - [x] Visual indicator for active chat
  - [x] Different styling for selected state

- [x] **Handle chat switching**
  - [x] Click to switch between chats
  - [x] Pass selected chatId to chat interface
  - [x] Maintain scroll position in chat list

---

## Phase 4: Chat Interface

### Step 8: Create Message Display Component
- [x] **Create ChatInterface.tsx**
  - [x] Use Convex query to fetch last 30 messages
  - [x] Handle loading states

- [x] **Display messages with:**
  - [x] Sender info (name, avatar)
  - [x] Content (text, formatting)
  - [x] Timestamp (relative time)
  - [x] Seen status indicators

### Step 9: Implement Message Bubbles
- [x] **Create MessageBubble.tsx component**
  - [x] Different styling for sent vs received messages
  - [x] Proper alignment (right for sent, left for received)

- [x] **Show read receipts**
  - [x] Single checkmark for sent
  - [x] Double checkmark for seen
  - [x] Color coding for status

### Step 10: Implement Infinite Scroll (Reverse Pagination)
- [x] **Detect when user scrolls to top**
  - [x] Intersection Observer for scroll detection
  - [x] Loading indicator for older messages

- [x] **Use Convex pagination to load next 30 messages**
  - [x] Prepend to message list
  - [x] Maintain scroll position after loading
  - [x] Handle end of message history

### Step 11: Create Message Input Component
- [x] **Create MessageInput.tsx**
  - [x] Text input field with auto-resize
  - [x] Send button (disabled when empty)
  - [x] Enter key to send message

- [x] **Implement message sending**
  - [x] Use Convex mutation to send message
  - [x] Clear input after sending
  - [x] Handle sending states (loading, error)

---

## Phase 5: Real-time Features

### Step 12: Implement Real-time Message Updates
- [x] **Leverage Convex real-time queries**
  - [x] New messages appear instantly
  - [x] No useEffect or manual state management needed
  - [x] Automatic UI updates

- [x] **Handle real-time chat list updates**
  - [x] New messages update chat previews
  - [x] Timestamps update in real-time
  - [x] Unread counts update automatically

### Step 13: Implement Seen/Unseen Logic
- [x] **When user opens a chat**
  - [x] Trigger markMessagesAsSeen mutation
  - [x] Update seen status for all messages in chat
  - [x] Update seenAt timestamps

- [x] **Update unread count in real-time**
  - [x] Use Convex query for total unseen count
  - [x] Show red dot on chat icon in dock when unread messages exist
  - [x] Update dock badge in real-time

---

## Phase 6: Integration & Polish

### Step 14: Create Main Chat Page Layout
- [x] **Create page.tsx for /chat route**
  - [x] Two-column layout:
    - [x] Left: ChatSidebar (30% width)
    - [x] Right: ChatInterface (70% width)

- [x] **Make responsive for mobile**
  - [x] Stacked layout on mobile devices
  - [x] Hide/show sidebar with toggle button
  - [x] Touch-friendly interactions

### Step 15: Connect Dock Icon
- [x] **Query for total unseen message count**
  - [x] Use Convex query to get global unread count
  - [x] Update in real-time

- [x] **Show red dot badge on chat icon**
  - [x] Display when count > 0
  - [x] Show actual count if > 9
  - [x] Update in real-time via Convex

- [x] **Handle dock navigation**
  - [x] Click chat icon navigates to /chat
  - [x] Maintain current chat selection
  - [x] Handle deep linking to specific chats

---

## Phase 7: Testing & Optimization

### Step 16: Testing
- [ ] **Test real-time functionality**
  - [ ] Multiple users sending messages
  - [ ] Seen status updates
  - [ ] Unread count accuracy

- [ ] **Test edge cases**
  - [ ] Network disconnection/reconnection
  - [ ] Large message history
  - [ ] Invalid chatId searches

- [ ] **Performance testing**
  - [ ] Large number of chats
  - [ ] Long message history
  - [ ] Search performance

### Step 17: Polish & UX Improvements
- [ ] **Add loading states**
  - [ ] Skeleton loaders for chat list
  - [ ] Message sending indicators
  - [ ] Search loading states

- [ ] **Add error handling**
  - [ ] Network error recovery
  - [ ] Invalid message handling
  - [ ] User-friendly error messages

- [ ] **Add keyboard shortcuts**
  - [ ] Enter to send message
  - [ ] Escape to close modals
  - [ ] Arrow keys for chat navigation

---

## Notes
- Each task should be completed and tested before moving to the next
- Use Convex's real-time capabilities to avoid manual state management
- Focus on mobile responsiveness throughout development
- Test with multiple users to ensure real-time functionality works correctly
- Consider adding message timestamps, typing indicators, and message status in future iterations

## Dependencies
- Convex backend setup
- User authentication system
- Existing UI components (buttons, inputs, modals)
- Responsive design system
