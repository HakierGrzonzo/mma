"use client";
import { useState } from 'react'
import {SeriesMetadata} from '../utils'
import { Link } from '@nextui-org/link';

interface Props {
  metadatas: SeriesMetadata[]
  }

type Filters = 'name' | 'upload' | 'upvote'

type Metadata = Omit<SeriesMetadata, 'latest_episode'> & {latest_episode: Date}

const filterFunctions: Record<Filters, (a: Metadata, b: Metadata) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  upvote: (a, b) => b.upvotes_total - a.upvotes_total,
  upload: (a, b) => b.latest_episode.valueOf() - a.latest_episode.valueOf()
}

export function MetaTable({metadatas}: Props) {
  const [filter, setFilter] = useState<Filters>('upload')
  const formatter = new Intl.DateTimeFormat('en', {day: 'numeric', month: 'long', year: 'numeric'})
  const data = metadatas.map((item) => ({...item, latest_episode: new Date(item.latest_episode)}));
  const sortedData = data.sort(filterFunctions[filter])
  return (
    <table className="table-auto">
      <thead className="border-b">
      <tr>
        <th className={`text-left hover:text-sky-600 ${filter==='name' && 'text-sky-600'}`} onClick={() => setFilter('name')}>Title</th>
        <th className={`text-left hover:text-sky-600 ${filter==='upload' && 'text-sky-600'}`} onClick={() => setFilter('upload')}>Upload date</th>
        <th className={`text-left hover:text-sky-600 ${filter==='upvote' && 'text-sky-600'}`} onClick={() => setFilter('upvote')}>Total upvotes</th>
      </tr>
      </thead>
      <tbody>
      {sortedData.map(item => (
        <tr key={item.name} className="hover:border-b">
          <td>
            <Link href={`/comic/${encodeURIComponent(item.directory_name)}`}>{item.name}</Link></td>
          <td>{formatter.format(item.latest_episode)}</td>
          <td className="text-right">{item.upvotes_total}</td>
        </tr>
      ))}
      </tbody>
    </table>
  ) 
}
