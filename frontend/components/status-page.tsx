'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, Server, List, AlertTriangle } from "lucide-react"

type ItemStatus = {
  name: string;
  status: 'up' | 'down' | 'unknown';
};

type StatusData = {
  jobQueues: ItemStatus[];
  loginNodes: ItemStatus[];
  lastUpdated: Date;
};

type UptimeData = {
  timestamp: string;
  login_nodes: { [key: string]: 'up' | 'down' | 'unknown' };
  slurm_queues: { [key: string]: 'up' | 'down' | 'unknown' };
};

type StatusItemProps = {
  title: string;
  items: ItemStatus[];
  icon: JSX.Element;
};

const fetchStatusData = async (): Promise<StatusData> => {
  try {
    const response = await fetch('https://supercomputing.swin.edu.au/monitor/api/status')
    const data = await response.json()
    return {
      jobQueues: Object.keys(data.slurm_queues).map(name => ({
        name,
        status: data.slurm_queues[name] as 'up' | 'down' | 'unknown'
      })),
      loginNodes: Object.keys(data.login_nodes).map(name => ({
        name,
        status: data.login_nodes[name] as 'up' | 'down' | 'unknown'
      })),
      lastUpdated: new Date()
    }
  } catch (error) {
    console.error('Error fetching status:', error)
    return {
      jobQueues: [
        { name: 'unknown', status: 'unknown' }
      ],
      loginNodes: [
        { name: 'unknown', status: 'unknown' }
      ],
      lastUpdated: new Date()
    }
  }
}

const fetchUptimeData = async (): Promise<UptimeData[]> => {
  try {
    const response = await fetch('https://supercomputing.swin.edu.au/monitor/api/uptime')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching uptime data:', error)
    return []
  }
}

export function StatusPage() {
  const [status, setStatus] = useState<StatusData>({
    jobQueues: [],
    loginNodes: [],
    lastUpdated: new Date()
  })
  const [uptime, setUptime] = useState<UptimeData[]>([])

  const updateStatus = async () => {
    const data = await fetchStatusData()
    setStatus({
      jobQueues: data.jobQueues,
      loginNodes: data.loginNodes,
      lastUpdated: new Date()
    })
  }

  const updateUptime = async () => {
    const data = await fetchUptimeData()
    setUptime(data)
  }

  useEffect(() => {
    updateStatus()
    updateUptime()
    const interval = setInterval(() => {
      updateStatus()
      updateUptime()
    }, 60000) // Update every minute
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
    const allOperational = status.jobQueues.every(q => q.status === 'up') && status.loginNodes.every(n => n.status === 'up')
    return allOperational
      ? "All systems are operational"
      : "We're experiencing issues with some systems"
  }

  const hasUnknownStatus = status.jobQueues.some(q => q.status === 'unknown') || status.loginNodes.some(n => n.status === 'unknown')

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
          {hasUnknownStatus && (
            <div className="text-center text-yellow-600">
              <AlertTriangle className="inline-block h-6 w-6 mr-2" />
              <span>
                Some statuses are unknown. This is usually caused by a networking outage at Swinburne University. Please check Swinburne&apos;s status page for more information.
              </span>
              <div className="mt-2">
                <a href="https://www.swinburne.edu.au/app/it-outages/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Swinburne IT Service Interruptions
                </a>
              </div>
            </div>
          )}
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
          <HistoryTimeline data={uptime} />
          <div className="text-sm text-gray-500 mt-4">
            Last updated: {formatDate(status.lastUpdated)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusItem({ title, items, icon }: StatusItemProps) {
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

function HistoryTimeline({ data }: { data: UptimeData[] }) {
  const hoursToShow = 24
  const allItems: (keyof UptimeData)[] = data.length > 0 ? (Object.keys(data[0]).filter(key => key !== 'timestamp') as (keyof UptimeData)[]) : []

  const getStatus = (entry: UptimeData, item: keyof UptimeData) => {
      return entry[item] || 'unknown'
  }

  const getItemLabel = (item: string) => {
    switch (item) {
      case 'login_nodes':
        return 'Login Nodes'
      case 'slurm_queues':
        return 'Job Queues'
      default:
        return item
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">System Status History (Last {hoursToShow} Hours)</h3>
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="flex items-center mb-2">
            <div className="w-24"></div>
            <div className="flex flex-1 justify-between text-xs text-gray-500">
              <span>24h ago</span>
              <span>Now</span>
            </div>
          </div>
          {allItems.map((item) => (
            <div key={item} className="flex items-center mb-2">
              <div className="w-24 text-sm font-medium truncate mr-2">{getItemLabel(item)}</div>
              <div className="flex flex-1">
                {Array.from({ length: hoursToShow }).map((_, index) => {
                  const entry = data[hoursToShow - index - 1]
                  const status = entry ? getStatus(entry, item as keyof UptimeData) : 'unknown'
                  return (
                    <div
                      key={index}
                      className={`flex-1 h-4 ${
                        status === 'up' ? 'bg-green-500' : status === 'down' ? 'bg-red-500' : status === 'partial' ? 'bg-yellow-500' : 'bg-gray-500'
                      } border-r border-white`}
                      title={`${getItemLabel(item)} - ${entry ? new Date(entry.timestamp).toLocaleString() : 'No data'}: ${
                        status === 'up' ? 'Operational' : status === 'down' ? 'Down' : status === 'partial' ? 'Partial' : 'Unknown'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
