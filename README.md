# AI-Enhanced To-Do List App

## Overview
A simple to-do list application built with Next.js and Supabase, enhanced with AI via n8n.

## Tech Stack
- Next.js (App Router)
- Supabase (Postgres)
- n8n (AI workflows)
- OpenAI
- Vercel

## Features
- Add, edit, and complete tasks
- Persistent storage
- AI-enhanced task titles
- Chatbot interface for task management

## Architecture
- UI triggers API routes
- API routes communicate with n8n via webhooks
- n8n handles AI logic and database updates
- Supabase is the single source of truth

## Deployment
- Hosted on Vercel
- Environment variables managed via Vercel dashboard

## Demo
See Loom video for full walkthrough.
