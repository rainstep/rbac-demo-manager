<template>
  <div class="main-content">
    <el-form class="query-form" inline>
      <el-form-item label="账号">
        <el-input v-model="searchUser.account" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="searchUser.userName" />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="searchUser.createTime"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="find(1)"
          >搜索</el-button
        >
        <el-button type="primary" icon="el-icon-edit" @click="handleAdd"
          >新增</el-button
        >
      </el-form-item>
    </el-form>

    <el-table class="data-table" :data="userList" stripe border>
      <el-table-column prop="userId" label="用户ID" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="account" label="账号" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" @click="del(scope.row.userId)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="data-pagination"
      background
      :total="totalCount"
      :current-page="currentPageNum"
      @size-change="pageSizeChange"
      @current-change="pageNumChange"
    />

    <el-dialog
      title="用户信息编辑"
      :close-on-click-modal="false"
      :visible.sync="editDialogVisible"
      @close="handleDialogClose"
    >
      <el-form :model="editUser" ref="editForm" :rules="userRules">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editUser.userName"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model="editUser.account"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editUser.password" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import httpUtils from "@/utils/http-utils";
import dateUtils from "@/utils/date-utils";
import regexUtils from "@/utils/regex-utils";
import rbacHttp from "@/rbac-http.js";

export default {
  name: "User",
  data() {
    // 账号验证
    let validateAccount = (rule, value, callback) => {
      let result = regexUtils.checkAccount(value);
      if (result) callback();
      else callback(new Error("账号格式错误"));
    };
    // 密码验证
    let validatePassword = (rule, value, callback) => {
      let result = regexUtils.checkPassword(value);
      if (result) callback();
      else callback(new Error("密码格式错误"));
    };
    return {
      currentPageNum: 1,
      pageSize: 10,
      totalCount: 0,
      searchUser: {
        account: "",
        userName: "",
        createTime: []
      },
      userList: [],
      editUser: {},
      userRules: {
        userName: {
          required: true,
          min: 3,
          max: 10,
          message: "长度在 3 到 10 个字符",
          trigger: "blur"
        },
        account: {
          required: true,
          validator: validateAccount,
          trigger: "blur"
        },
        password: {
          required: true,
          validator: validatePassword,
          trigger: "blur"
        }
      },
      editDialogVisible: false
    };
  },
  mounted() {
    this.find();
  },
  methods: {
    find(pageNum = this.currentPageNum, pageSize = this.pageSize) {
      let url = "/user/list";
      let bCreateTime = null;
      let eCreateTime = null;
      if (this.searchUser.createTime[0])
        bCreateTime = dateUtils.formatDateTime(this.searchUser.createTime[0]);
      if (this.searchUser.createTime[1])
        eCreateTime = dateUtils.formatDateTime(this.searchUser.createTime[1]);
      let param = {
        account: this.searchUser.account,
        userName: this.searchUser.userName,
        bCreateTime: bCreateTime,
        eCreateTime: eCreateTime,
        pageNum: pageNum,
        pageSize: pageSize
      };
      rbacHttp.formPost(url, param).then(response => {
        if (pageNum !== this.currentPageNum) this.currentPageNum = pageNum;
        if (pageSize !== this.pageSize) this.pageSize = pageNum;
        this.userList = response.data.list;
        this.totalCount = response.data.totalCount;
      });
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.find();
    },
    pageNumChange(pageNum) {
      this.currentPageNum = pageNum;
      this.find();
    },
    handleAdd() {
      this.editDialogVisible = true;
    },
    handleEdit(index, row) {
      this.editUser = row;
      this.editDialogVisible = true;
    },
    save() {
      this.$refs["editForm"].validate(valid => {
        if (!valid) return;
        let param = {
          ...this.editUser
        };
        let url = param.userId ? "/user/modify" : "/user/add";
        rbacHttp.formPost(url, param).then(() => {
          this.$message.success("操作成功");
          this.find();
          this.editDialogVisible = false;
        });
      });
    },
    handleDialogClose() {
      this.editUser = {};
      this.$refs["editForm"].resetFields();
    },
    del(userId) {
      this.$confirm("确定要删除吗？", "提示", { type: "warning" })
        .then(() => {
          let url = "/user/delete";
          let param = { userId };
          rbacHttp.formPost(url, param).then(() => {
            this.$message.success("删除成功");
            this.find();
          });
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.main-content {
  height: 100%;
  overflow-y: auto;
}
.query-form {
  margin-top: 15px;
  padding-top: 20px;
  padding-left: 20px;
  background-color: #f2f2f2;
}
.data-table {
  margin-top: 20px;
}
.data-pagination {
  margin-top: 20px;
  /*text-align: center;*/
}
</style>
