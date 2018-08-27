package com.zts.robot.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zts.robot.mapper.AwardsMapper;
import com.zts.robot.mapper.RaceTeamMemberMapper;
import com.zts.robot.mapper.RaceTeamScoreMapper;
import com.zts.robot.pojo.Awards;
import com.zts.robot.pojo.RaceTeamScore;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

@Service
public class AwardsService {
	@Autowired
	private AwardsMapper awardsMapper;
	@Autowired
	private RaceTeamScoreMapper raceTeamScoreMapper;
	@Autowired
	private RaceTeamMemberMapper raceTeamMemberMapper;
	
	public void setAwardsByRid(JSONArray awardsJsonArray, String rid, Map<String, Object> resultMap) {
		// TODO 自动生成的方法存根
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("rid", rid);
		map.put("tname", "");
		//根据赛项ID删除当前的奖项
		awardsMapper.delAwardsByRid(rid);
		//循环添加奖项
		for(int i = 0;i<awardsJsonArray.size();i++){
			Awards awards = (Awards) JSONObject.toBean(awardsJsonArray.getJSONObject(i), Awards.class);
			awardsMapper.insertSelective(awards);
		}
		int teamnum=raceTeamMemberMapper.findTeamCountByRid(rid);//队伍数量
				//该赛项下的参赛队伍
				List<Map<String, Object>> teamList = raceTeamScoreMapper.findTeamScoreByRid(map);
				//检测是否有成绩
					if(!teamList.get(0).containsKey("score")||teamList.get(0).get("score")==null || "0".equals(teamList.get(0).get("score"))){
						resultMap.put("status", 1);
						resultMap.put("errmsg", "该赛项参赛队成绩未录入！");
						throw new RuntimeException();
					}else{
						List<Map<String, Object>> awardsList = new ArrayList<Map<String,Object>>();
						List<Map<String, Object>> distributionAwardsList = new ArrayList<Map<String,Object>>();
						List<Map<String, Object>> cupList = new ArrayList<Map<String,Object>>();
						

						//奖项预览，界面传值
						//String 	awardsJson = request.getParameter("awardsJson");
						//JSONArray awardsJSONArray = JSONArray.fromObject(awardsJson);
						for(int i = 0 ;i<awardsJsonArray.size();i++){
							Map<String, Object> tempMap = (Map<String, Object>) awardsJsonArray.get(i);
							awardsList.add(tempMap);
						}
						//处理奖项数量
						if(awardsList.size()!=0){
							for(Map<String, Object> awardsMap:awardsList){
								//四舍五入（队伍人数*比例数/100）
								 /*int count = new BigDecimal(teamnum*(int)awardsMap.get("aproportion")/100).setScale(0, BigDecimal.ROUND_HALF_UP).intValue();*/
								 int count = (int) awardsMap.get("aproportion");
								 for(int i = 0;i<count;i++){
									 distributionAwardsList.add(awardsMap);
								 }
							}
						}else{
							Map<String, Object> awardsMap = new HashMap<String, Object>();
							awardsMap.put("aname", "");
							for(int i = 0;i<teamnum;i++){
								distributionAwardsList.add(awardsMap);
							}
						}
						
						List<Map<String, Object>> tempList=new ArrayList<Map<String,Object>>();
						//第一次 分配奖项
						for(int i=0;i<teamList.size();i++){
							Map<String, Object> scoreRankingMap = teamList.get(i);
							if("00".equals(scoreRankingMap.get("flg"))){
								if(i<distributionAwardsList.size()){
									scoreRankingMap.put("awards", distributionAwardsList.get(i).get("aname"));
								}else{
									scoreRankingMap.put("awards", "");
								}
								
							}else{
								scoreRankingMap.put("awards", "");
								scoreRankingMap.put("cup", "");
							}
							tempList.add(scoreRankingMap);
						}
						//第二次 处理成绩相同的奖项，奖杯
						//成绩单列表
						List<Map<String, Object>> scoreRankingList=new ArrayList<Map<String,Object>>();
						int j=0;
						for(int i=0;i<tempList.size();i++){
							Map<String, Object> scoreRankingMap = tempList.get(i);
							//处理奖杯
							if("00".equals(tempList.get(i).get("flg"))){			
								if(cupList.size()==0){
									scoreRankingMap.put("cup", "");
								}else{
									if(i==0){
										scoreRankingMap.put("cup", cupList.get(j).get("cname"));
										j++;
									}else{
										if(tempList.get(i-1).get("score").equals(scoreRankingMap.get("score"))){
											scoreRankingMap.put("cup", tempList.get(i-1).get("cup"));
										}else{
											if(j<cupList.size()){
												scoreRankingMap.put("cup", cupList.get(j).get("cname"));
												j++;
											}else{
												scoreRankingMap.put("cup", "");
											}						
										}
									}
								}
							}
							//处理奖项
							if(i!=0){
								if(tempList.get(i-1).get("score").equals(scoreRankingMap.get("score"))){
									scoreRankingMap.put("awards", tempList.get(i-1).get("awards"));
								}
							}
							scoreRankingList.add(scoreRankingMap);
						}
						for (Map<String, Object> maps:scoreRankingList) {
							String flg=maps.get("flg").toString();							
							if("00".equals(flg)){								
							String awards;
							if(maps.get("awards")==null){
								awards="";
							}else{
								awards=maps.get("awards").toString();
							}
							String tid = maps.get("tid").toString();
							RaceTeamScore raceTeamScore=new RaceTeamScore();
							raceTeamScore.setRid(rid);
							raceTeamScore.setTid(tid);
							raceTeamScore.setAwards(awards);
							raceTeamScoreMapper.updateByPrimaryKeySelective(raceTeamScore);
							}
						}
				resultMap.put("status", 0);
					}
					
				
				
	}

	public List<Map<String, Object>> findAwardsByRid(String rid) {
		return awardsMapper.findAwardsListByRid(rid);		
	}

	
}
