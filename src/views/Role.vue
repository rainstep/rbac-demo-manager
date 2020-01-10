<template>
  <div class="main-content">
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-edit" @click="handleAdd"
        >新增</el-button
      >
    </div>

    <el-table :data="roleList" stripe border>
      <el-table-column prop="roleId" label="角色ID" />
      <el-table-column prop="roleName" label="角色名" />
      <el-table-column prop="roleCode" label="角色编码" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >
          <el-button size="mini" @click="handleRolePermission(scope.row)"
            >分配权限</el-button
          >
          <el-button size="mini" type="danger" @click="del(scope.row.roleId)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="角色信息编辑"
      :close-on-click-modal="false"
      :visible.sync="editDialogVisible"
      @close="handleDialogClose"
    >
      <el-form
        :model="editRole"
        ref="editForm"
        :rules="roleRules"
        label-width="80px"
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRole.roleName" placeholder="2 ~ 10个字符" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input
            v-model="editRole.roleCode"
            placeholder="以字母、下划线开头，只允许字母、数字和下划线，最少3位长度"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="角色权限分配"
      :close-on-click-modal="false"
      :visible.sync="editRolePermissionDialogVisible"
      width="400px"
    >
      <el-form :model="editRolePermission" label-width="80px">
        <el-select
          v-model="editRolePermission.permissionIds"
          multiple
          clearable
          placeholder="请选择"
        >
          <el-option-group
            v-for="resource in resourcePermissionList"
            :key="resource.resourceId"
            :label="resource.resourceName"
          >
            <el-option
              v-for="permission in resource.permissionList"
              :key="permission.permissionId"
              :label="permission.permissionName"
              :value="permission.permissionId"
            />
          </el-option-group>
        </el-select>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editRolePermissionDialogVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="saveRolePermission">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import rbacHttp from "@/rbac-http.js";
import regexUtils from "@/utils/regex-utils";

export default {
  name: "Role",
  data() {
    // 角色编码验证
    let validateRoleCode = (rule, value, callback) => {
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
      roleList: [],
      editRole: {},
      editDialogVisible: false,
      roleRules: {
        roleName: {
          required: true,
          min: 2,
          max: 10,
          message: "角色名长度在2 ~ 10个字符",
          trigger: "blur"
        },
        roleCode: {
          required: true,
          validator: validateRoleCode,
          trigger: "blur"
        }
      },
      resourcePermissionList: [],
      editRolePermission: {
        permissionIds: []
      },
      editRolePermissionDialogVisible: false
    };
  },
  mounted() {
    this.find();
  },
  methods: {
    find() {
      let url = "/role/listAll";
      rbacHttp.formPost(url).then(response => {
        this.roleList = response.data;
      });
    },
    handleAdd() {
      this.editDialogVisible = true;
    },
    handleEdit(index, row) {
      this.editRole = row;
      this.editDialogVisible = true;
    },
    save() {
      this.$refs["editForm"].validate(valid => {
        if (!valid) return;
        let param = {
          ...this.editRole
        };
        let url = param.roleId ? "/role/modify" : "/role/add";
        rbacHttp.formPost(url, param).then(() => {
          this.$message.success("操作成功");
          this.find();
          this.editDialogVisible = false;
        });
      });
    },
    handleDialogClose() {
      this.editRole = {};
      this.$refs["editForm"].clearValidate();
    },
    del(roleId) {
      this.$confirm("确定要删除吗？", "提示", { type: "warning" })
        .then(() => {
          let url = "/role/delete";
          let param = { roleId };
          rbacHttp.formPost(url, param).then(() => {
            this.$message.success("删除成功");
            this.find();
          });
        })
        .catch(() => {});
    },
    handleRolePermission(row) {
      if (this.resourcePermissionList.length == 0) {
        this.findPermissionTree();
      }
      let roleId = row.roleId;
      let url = "/role/permissionIdList";
      let param = { roleId };
      rbacHttp
        .formPost(url, param)
        .then(response => {
          this.editRolePermission.roleId = roleId;
          this.editRolePermission.permissionIds = response.data;
          this.editRolePermissionDialogVisible = true;
        })
        .catch(() => {});
    },
    findPermissionTree() {
      let url = "/permission/treeList";
      rbacHttp
        .formPost(url)
        .then(response => (this.resourcePermissionList = response.data));
    },
    saveRolePermission() {
      let param = {
        ...this.editRolePermission
      };
      let url = "role/permissionSave";
      rbacHttp.formPost(url, param).then(() => {
        this.$message.success("操作成功");
        this.find();
        this.editRolePermissionDialogVisible = false;
      });
    }
  }
};
</script>

<style scoped></style>
