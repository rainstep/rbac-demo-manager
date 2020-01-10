<template>
  <div class="main-content">
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-edit" @click="handleAdd"
        >新增</el-button
      >
      <el-button type="danger" icon="el-icon-delete" @click="batchDelete"
        >批量删除</el-button
      >
    </div>

    <el-form class="query-form" inline>
      <el-form-item label="账号">
        <el-input v-model="searchParam.account" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="searchParam.userName" />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="searchParam.createTime"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="medium"
          @click="find(1)"
          >搜索</el-button
        >
      </el-form-item>
    </el-form>

    <el-table
      :data="pageData.list"
      stripe
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" />
      <el-table-column prop="userId" label="用户ID" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="account" label="账号" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" @click="handleUserRole(scope.row)"
            >分配角色</el-button
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
      :total="pageData.totalCount"
      :current-page="searchParam.pageNum"
      :page-size="searchParam.pageSize"
      @size-change="pageSizeChange"
      @current-change="pageNumChange"
      layout="total, sizes, prev, pager, next, jumper"
    />

    <el-dialog
      title="用户信息编辑"
      :close-on-click-modal="false"
      :visible.sync="editDialogVisible"
      @close="handleDialogClose"
      width="600px"
    >
      <el-form
        :model="editUser"
        ref="editForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editUser.userName" placeholder="2 ~ 10个字符" />
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input
            v-model="editUser.account"
            placeholder="以字母、下划线开头，只允许字母、数字和下划线，最少5位长度"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="editUser.password"
            type="password"
            placeholder="只允许字母、数字和下划线，最少6位长度"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="用户角色分配"
      :close-on-click-modal="false"
      :visible.sync="editUserRoleDialogVisible"
      width="400px"
    >
      <el-form :model="editUserRole" label-width="80px">
        <el-select
          v-model="editUserRole.roleIds"
          multiple
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="role in roleList"
            :key="role.roleId"
            :label="role.roleName"
            :value="role.roleId"
          >
          </el-option>
        </el-select>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUserRole">确 定</el-button>
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
      else
        callback(
          new Error(
            "账号以字母、下划线开头，只允许字母、数字和下划线，最少5位长度"
          )
        );
    };
    // 密码验证
    let validatePassword = (rule, value, callback) => {
      let result = regexUtils.checkPassword(value);
      if (result) callback();
      else callback(new Error("密码只允许字母、数字和下划线，最少6位长度"));
    };
    return {
      searchParam: {
        account: "",
        userName: "",
        createTime: [],
        pageNum: 1,
        pageSize: 10
      },
      pageData: {
        totalCount: 0,
        userList: []
      },
      editUser: {},
      userRules: {
        userName: {
          required: true,
          min: 2,
          max: 10,
          message: "用户名长度在2 ~ 10个字符",
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
      editDialogVisible: false,
      roleList: [],
      editUserRole: {
        roleIds: []
      },
      editUserRoleDialogVisible: false,
      selectedUserList: []
    };
  },
  mounted() {
    this.find();
  },
  methods: {
    find(
      pageNum = this.searchParam.pageNum,
      pageSize = this.searchParam.pageSize
    ) {
      let url = "/user/list";
      let bCreateTime = null;
      let eCreateTime = null;
      if (this.searchParam.createTime) {
        if (this.searchParam.createTime[0])
          bCreateTime = dateUtils.formatDateTime(
            this.searchParam.createTime[0]
          );
        if (this.searchParam.createTime[1])
          eCreateTime = dateUtils.formatDateTime(
            this.searchParam.createTime[1]
          );
      }
      this.searchParam.bCreateTime = bCreateTime;
      this.searchParam.eCreateTime = eCreateTime;
      if (pageNum !== this.searchParam.pageNum)
        this.searchParam.pageNum = pageNum;
      if (pageSize !== this.searchParam.pageSize)
        this.searchParam.pageSize = pageSize;
      rbacHttp.formPost(url, this.searchParam).then(response => {
        this.pageData = response.data;
      });
    },
    pageSizeChange(pageSize) {
      console.log("pageSizeChange: %d", pageSize);
      this.searchParam.pageSize = pageSize;
      this.find();
    },
    pageNumChange(pageNum) {
      console.log("pageNumChange: %d", pageNum);
      this.searchParam.pageNum = pageNum;
      this.find();
    },
    handleAdd() {
      this.editDialogVisible = true;
    },
    handleEdit(row) {
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
      this.$refs["editForm"].clearValidate();
    },
    del(userId) {
      this.$confirm("确定要删除吗？", "提示", { type: "warning" })
        .then(() => {
          let url = "/user/delete";
          let param = { userId };
          rbacHttp.formPost(url, param).then(() => {
            this.$message.success("删除成功");
            if (this.userList.length === 1 && this.currentPageNum > 1) {
              this.searchParam.pageNum--;
            }
            this.find();
          });
        })
        .catch(() => {});
    },
    handleUserRole(row) {
      if (this.roleList.length == 0) {
        this.findRole();
      }
      let userId = row.userId;
      let url = "/user/roleIdList";
      let param = { userId };
      rbacHttp
        .formPost(url, param)
        .then(response => {
          this.editUserRole.userId = userId;
          this.editUserRole.roleIds = response.data;
          this.editUserRoleDialogVisible = true;
        })
        .catch(() => {});
    },
    findRole() {
      let url = "/role/listAll";
      rbacHttp.formPost(url).then(response => (this.roleList = response.data));
    },
    saveUserRole() {
      let param = {
        ...this.editUserRole
      };
      let url = "user/roleSave";
      rbacHttp.formPost(url, param).then(() => {
        this.$message.success("操作成功");
        this.find();
        this.editUserRoleDialogVisible = false;
      });
    },
    handleSelectionChange(values) {
      this.selectedUserList = values;
    },
    batchDelete() {
      if (this.selectedUserList.length === 0) {
        this.$message.info("请选中要删除行的数据");
        return;
      }
      this.$confirm("确定要删除吗？", "提示", { type: "warning" })
        .then(() => {
          let userIds = this.selectedUserList.map(item => item.userId);
          let url = "/user/batchDelete";
          let param = { userIds };
          rbacHttp.formPost(url, param).then(() => {
            this.$message.success("删除成功");
            if (
              this.pageData.list.length === userIds.length &&
              this.searchParam.pageNum > 1
            ) {
              this.searchParam.pageNum--;
            }
            this.find();
          });
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped></style>
