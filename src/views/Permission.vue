<template>
  <div class="main-content">
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-edit" @click="handleAdd"
        >新增</el-button
      >
    </div>

    <el-form class="query-form" inline>
      <el-form-item label="权限名">
        <el-input v-model="searchParam.permissionName" />
      </el-form-item>
      <el-form-item label="权限编码">
        <el-input v-model="searchParam.permissionCode" />
      </el-form-item>
      <el-form-item label="所属资源" prop="resourceId">
        <el-select
          v-model="searchParam.resourceId"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="resource in resourceList"
            :key="resource.resourceId"
            :label="resource.resourceName"
            :value="resource.resourceId"
          >
          </el-option>
        </el-select>
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

    <el-table :data="pageData.list" stripe border>
      <el-table-column prop="permissionId" label="权限ID" />
      <el-table-column prop="permissionName" label="权限名" />
      <el-table-column prop="permissionCode" label="权限编码" />
      <el-table-column
        prop="resourceId"
        label="所属资源"
        :formatter="resourceFormatter"
      />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="del(scope.row.permissionId)"
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
      title="权限信息编辑"
      :close-on-click-modal="false"
      :visible.sync="editDialogVisible"
      @close="handleDialogClose"
      width="500px"
    >
      <el-form
        :model="editPermission"
        ref="editForm"
        :rules="permissionRules"
        label-width="80px"
      >
        <el-form-item label="权限名" prop="permissionName">
          <el-input
            v-model="editPermission.permissionName"
            placeholder="2 ~ 10个字符"
          />
        </el-form-item>
        <el-form-item label="权限编码" prop="permissionCode">
          <el-input
            v-model="editPermission.permissionCode"
            placeholder="以字母、下划线开头，只允许字母、数字和下划线，最少3位长度"
          />
        </el-form-item>
        <el-form-item label="所属资源" prop="resourceId">
          <el-select
            v-model="editPermission.resourceId"
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="resource in resourceList"
              :key="resource.resourceId"
              :label="resource.resourceName"
              :value="resource.resourceId"
            >
            </el-option>
          </el-select>
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
import rbacHttp from "@/rbac-http.js";
import regexUtils from "@/utils/regex-utils";

export default {
  name: "Permission",
  data() {
    // 角色编码验证
    let validatePermissionCode = (rule, value, callback) => {
      let result = regexUtils.checkCode(value);
      if (result) callback();
      else
        callback(
          new Error(
            "编码以字母、下划线开头，只允许字母、数字和下划线，最少3位长度"
          )
        );
    };
    return {
      resourceList: [],
      searchParam: {
        pageNum: 1,
        pageSize: 10
      },
      pageData: {
        totalCount: 0,
        permissionList: []
      },
      editPermission: {},
      editDialogVisible: false,
      permissionRules: {
        permissionName: {
          required: true,
          min: 2,
          max: 10,
          message: "权限名长度在2 ~ 10个字符",
          trigger: "blur"
        },
        permissionCode: {
          required: true,
          validator: validatePermissionCode,
          trigger: "blur"
        },
        resourceId: {
          required: true,
          message: "所属资源不能为空",
          trigger: "blur"
        }
      }
    };
  },
  created() {
    this.findResource();
  },
  mounted() {
    this.find();
  },
  methods: {
    findResource() {
      let url = "/resource/list";
      rbacHttp
        .formPost(url)
        .then(response => (this.resourceList = response.data));
    },
    find(
      pageNum = this.searchParam.pageNum,
      pageSize = this.searchParam.pageSize
    ) {
      let url = "/permission/list";
      if (pageNum !== this.searchParam.pageNum)
        this.searchParam.pageNum = pageNum;
      if (pageSize !== this.searchParam.pageSize)
        this.searchParam.pageSize = pageSize;
      rbacHttp
        .formPost(url, this.searchParam)
        .then(response => (this.pageData = response.data));
    },
    resourceFormatter(row) {
      let resultItem = this.resourceList.find(
        item => item.resourceId === row.resourceId
      );
      return resultItem ? resultItem.resourceName : "未知";
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
    handleEdit(index, row) {
      this.editPermission = row;
      this.editDialogVisible = true;
    },
    save() {
      this.$refs["editForm"].validate(valid => {
        if (!valid) return;
        let param = {
          ...this.editPermission
        };
        let url = param.permissionId ? "/permission/modify" : "/permission/add";
        rbacHttp.formPost(url, param).then(() => {
          this.$message.success("操作成功");
          this.find();
          this.editDialogVisible = false;
        });
      });
    },
    handleDialogClose() {
      this.editPermission = {};
      this.$refs["editForm"].clearValidate();
    },
    del(permissionId) {
      this.$confirm("确定要删除吗？", "提示", { type: "warning" })
        .then(() => {
          let url = "/permission/delete";
          let param = { permissionId };
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

<style scoped></style>
