package com.zts.robot.mapper;

import com.zts.robot.pojo.Member;

public interface MemberMapper extends WriteMemberMapper{
    int deleteByPrimaryKey(String tmid);

    int insert(Member record);

    int insertSelective(Member record);

    Member selectByPrimaryKey(String tmid);

    int updateByPrimaryKeySelective(Member record);

    int updateByPrimaryKey(Member record);
}