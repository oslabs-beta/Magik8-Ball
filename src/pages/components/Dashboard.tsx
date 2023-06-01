import React, { useState } from 'react';
import { signIn, signOut, useSession } from "next-auth/react";
import ChartContainer from './ChartContainer';
import { DashBlank } from './DashBlank';
import { api } from "~/utils/api";


interface DashboardProps {
  clusterIP: string;
  clusterIPArray: Array<any>;
  snapshotObj: object;
  setSnapshotObj: any;
  dashNum: number;
  currClusterId: string;
}






const Dashboard: React.FC<DashboardProps> = ({ clusterIP, clusterIPArray, snapshotObj, setSnapshotObj, dashNum, currClusterId }) => {
  // added timestamp state (defaults to 'now') to keep track of in individual dashboard components 
  const [currentTimeStamp, setCurrentTimeStamp] = useState('now')
  // added labelName state 
  const [labelName, setLabelName] = useState('')
  const { data: sessionData } = useSession();
  // const [tabIP, setTabIP] = useState('')
  const { data: snapshots , refetch: refetchSnaps } = api.snapshot.getAll.useQuery()
  const { data: filteredSnapshots, refetch: refetchfilteredSnapshots } =api.snapshot.getByUserCluster.useQuery({clusterIP: ''})
  const [currentClusterIP, setCurrentClusterIP] = useState('34.70.193.242'); //temp

  const handleTabClick = (ip: string) => {
    setCurrentClusterIP(ip);
  };
  
  // hook to create snapshot in db
  const createNewSnapshot = api.snapshot.createNew.useMutation({
    onSuccess:()=>{
      refetchSnaps();
      refetchfilteredSnapshots({clusterIP: currentClusterIP});
    }
  })


  // eventHandlers 

  // add a property in snapshotObj 
  const handleSnapshotSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const unixTimeStamp = Date.now();
    const date = new Date(unixTimeStamp);
    const formattedDate = date.toLocaleString()
    const obj = { ...snapshotObj }
  // if labelName exists add a property into snapshotObj    labelName: Unix Time  otherwise add a property as    M/D/Y Time: Unix Time
    console.log(labelName)
    labelName ? obj[labelName] = unixTimeStamp : obj[formattedDate] = unixTimeStamp  
    setSnapshotObj(obj)
    createNewSnapshot.mutate({
      unixtime: unixTimeStamp,
      label: labelName,
      clusterIP: currentClusterIP
    })
    console.log('new snapshotObj', snapshotObj)
  }

  // set currentTimeStamp state to option we choose on the dropbown
  const handleDashboardChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault()
    const changedTimeStamp = event.target.value
    // console.log('snapshotObj', snapshotObj, 'event value', event.target.value)
    // console.log('changedTimeStamp', changedTimeStamp)
    setCurrentTimeStamp(changedTimeStamp)
    // console.log('currentTimeStamp', currentTimeStamp)
  }


  // set labelName to our input 
  const handleLabelChange = (event: any) => {
    event.preventDefault()
    setLabelName(event.target.value)
  }

  




  return (
    <>
      {dashNum === 1 ? 
        <div className="tabs flex justify-center">

          {/* // iterate over array if object.userId matches sessionData.user.id  */}
          {
            clusterIPArray?.filter(el => {
              const userInfo = el.userId
              return (userInfo == sessionData.user.id);
            }).map((obj) => {
              const ip = obj.ipAddress;
              <a
                key={ip}
                className={`tab tab-lg tab-lifted ${ip === currentClusterIP ? 'tab-active' : ''}`}
                onClick={() => handleTabClick(ip)}
              >
                {ip}
              </a>
            ``})
          }
        </div> : ''}

      {/* {console.log(currentClusterIP, "DFHSLKDFJHDSF")} */}

      <div className="bg-accent/20 rounded-xl p-2 mb-6">
        <div className="flex justify-between ">
          <div className="dropdown dropdown-right ml-2">
            <label tabIndex={0} className="btn bg-info/10 m-1 ">Select Dashboard</label>
            <select
              tabIndex={0}
              className="dropdown-content w-52 h-8 ml-1 mt-3 "
              onChange={handleDashboardChange}
            >
              {dashNum === 2 ? Object.keys(snapshotObj).map(el => {
                if (el !== 'Current')
                  return (
                    <option value={snapshotObj[el]}>{el}</option>
                  );
              }) : Object.keys(snapshotObj).map(el => (
                <option value={snapshotObj[el]}>{el}</option>
              ))}
            </select>
          </div>



        {/* snapshot button */}
          {dashNum === 1 ? (
            <div className="mr-2">
            <form action="">
              <input type="text"
              placeholder='Snapshot Label' 
              onChange={handleLabelChange}
              className="input input-bordered max-h-xs max-w-xs bg-info/10 rounded-xl mr-3"/>
                {/* right margin of 2 units */}
                <button className="btn bg-info/10" onClick={handleSnapshotSubmit}>Snapshot</button>
            </form>
              </div>

            // other snapshot button
            // <div className="mr-2">
            //   <button className="btn bg-info/10" onClick={handleSnapshotSubmit}>Snapshot</button>
            // </div>
          ) : ''}
        </div>
          




        {(dashNum === 2 && Object.keys(snapshotObj).length > 1) ? (
          <ChartContainer currentClusterIP={currentClusterIP} currentTimeStamp={currentTimeStamp} />
        ) : (dashNum === 1 ? (
          <ChartContainer currentClusterIP={currentClusterIP} currentTimeStamp={currentTimeStamp} />
        ) : (
          <DashBlank />
        ))}

      </div>
    </>
  );
};

export default Dashboard;
