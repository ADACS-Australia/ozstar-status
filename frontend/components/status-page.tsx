'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, Server, List, AlertTriangle  } from "lucide-react"

type ItemStatus = {
  name: string;
  status: 'up' | 'down' | 'unknown';
};

type StatusData = {
  jobQueues: ItemStatus[];
  loginNodes: ItemStatus[];
  lastUpdated: Date;
};

const fetchStatusData = async () => {
  try {
    const response = await fetch('https://supercomputing.swin.edu.au/monitor/api/status')
    const data = await response.json()
    return {
      jobQueues: Object.keys(data.slurm_queues).map(name => ({
        name,
        status: data.slurm_queues[name]
      })),
      loginNodes: Object.keys(data.login_nodes).map(name => ({
        name,
        status: data.login_nodes[name]
      }))
    }
  } catch (error) {
    console.error('Error fetching status:', error)
    return {
      jobQueues: [
        { name: 'unknown', status: 'unknown' }
      ],
      loginNodes: [
        { name: 'unknown', status: 'unknown' }
      ]
    }
  }
}
export function StatusPage() {
  const [status, setStatus] = useState<StatusData>({
    jobQueues: [],
    loginNodes: [],
    lastUpdated: new Date()
  })

  const updateStatus = async () => {
    const data = await fetchStatusData()
    setStatus({
      jobQueues: data.jobQueues,
      loginNodes: data.loginNodes,
      lastUpdated: new Date()
    })
  }

  useEffect(() => {
    updateStatus()
    const interval = setInterval(updateStatus, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getSummaryMessage = () => {
    const hasUnknownStatus = status.jobQueues.some(q => q.status === 'unknown') || status.loginNodes.some(n => n.status === 'unknown')
    const allOperational = status.jobQueues.every(q => q.status === 'up') && status.loginNodes.every(n => n.status === 'up')

    if (allOperational) {
      return "All systems are operational"
    } else if (hasUnknownStatus) {
      return "Some systems have unknown status"
    } else {
      return "Some systems are unavailable"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">OzSTAR Supercomputing Status</CardTitle>
          <CardDescription>Current operational status of key systems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg font-semibold text-center p-2 rounded-lg bg-gray-100">
            {getSummaryMessage()}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatusItem
              title="Job Queues"
              items={status.jobQueues}
              icon={<List className="h-6 w-6" />}
            />
            <StatusItem
              title="Login Nodes"
              items={status.loginNodes}
              icon={<Server className="h-6 w-6" />}
            />
          </div>
          <div className="text-sm text-gray-500 mt-4">
            Last updated: {formatDate(status.lastUpdated)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusItem({ title, items, icon }) {
  const hasUnknownStatus = items.some(item => item.status === 'unknown')
  const allOperational = items.every(item => item.status === 'up')

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-4 mb-2">
        {icon}
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className={`text-sm ${allOperational ? 'text-green-600' : hasUnknownStatus ? 'text-yellow-600' : 'text-red-600'}`}>
            {allOperational ? 'All Operational' : hasUnknownStatus ? 'Status Unknown' : 'Issues Detected'}
          </p>
        </div>
        {allOperational ? (
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        ) : hasUnknownStatus ? (
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600" />
        )}
      </div>
      {!hasUnknownStatus && (
        <div className="mt-2 space-y-1">
          {items.map((item) => (
            item.name !== 'unknown' && (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span>{item.name}</span>
                {item.status === 'up' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}